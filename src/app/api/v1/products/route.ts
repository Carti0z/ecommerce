import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.enum(["price-asc", "price-desc", "newest", "popular", "rating"]).optional().default("newest"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "ACTIVE",
      publishedAt: { lte: new Date() },
    }

    if (query.category) {
      where.category = { slug: query.category }
    }

    if (query.brand) {
      where.brand = { slug: query.brand }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ]
    }

    if (query.minPrice || query.maxPrice) {
      where.basePrice = {}
      if (query.minPrice) where.basePrice.gte = parseFloat(query.minPrice)
      if (query.maxPrice) where.basePrice.lte = parseFloat(query.maxPrice)
    }

    // Build order by
    let orderBy: any = {}
    switch (query.sort) {
      case "price-asc":
        orderBy = { basePrice: "asc" }
        break
      case "price-desc":
        orderBy = { basePrice: "desc" }
        break
      case "newest":
        orderBy = { publishedAt: "desc" }
        break
      case "popular":
        orderBy = { reviews: { _count: "desc" } }
        break
      case "rating":
        orderBy = { reviews: { rating: "desc" } }
        break
      default:
        orderBy = { publishedAt: "desc" }
    }

    // Get products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
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
      prisma.product.count({ where }),
    ])

    // Calculate average rating for each product
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
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
