import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const querySchema = z.object({
  q: z.string().min(1),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    const searchTerm = query.q

    // Search products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          publishedAt: { lte: new Date() },
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { shortDescription: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { sku: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          images: {
            where: { sortOrder: 0 },
            take: 1,
          },
          inventory: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          status: "ACTIVE",
          publishedAt: { lte: new Date() },
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { shortDescription: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { sku: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      }),
    ])

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 5,
    })

    // Search brands
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 5,
    })

    // Calculate average rating for products
    const productsWithRating = await Promise.all(
      products.map(async (product) => {
        const avgRating = await prisma.productReview.aggregate({
          where: {
            productId: product.id,
            moderationStatus: "APPROVED",
          },
          _avg: {
            rating: true,
          },
        })

        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
        }
      })
    )

    return NextResponse.json({
      query: searchTerm,
      products: productsWithRating,
      categories,
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    )
  }
}
