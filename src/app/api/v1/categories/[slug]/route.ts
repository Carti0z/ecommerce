import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  sort: z.enum(["price-asc", "price-desc", "newest", "popular", "rating"]).optional().default("newest"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    const { slug } = await params

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    // Get category
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Get category IDs (including subcategories)
    const categoryIds = [category.id, ...category.children.map((c: any) => c.id)]

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

    // Get products in category
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          status: "ACTIVE",
          publishedAt: { lte: new Date() },
        },
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
      prisma.product.count({
        where: {
          categoryId: { in: categoryIds },
          status: "ACTIVE",
          publishedAt: { lte: new Date() },
        },
      }),
    ])

    // Calculate average rating
    const productsWithRating = await Promise.all(
      products.map(async (product: any) => {
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
      category,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}
