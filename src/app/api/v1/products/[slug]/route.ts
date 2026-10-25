import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: "ACTIVE",
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            inventory: true,
          },
        },
        specifications: {
          orderBy: { sortOrder: "asc" },
        },
        inventory: true,
        reviews: {
          where: {
            moderationStatus: "APPROVED",
          },
          include: {
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const ratingStats = await prisma.productReview.aggregate({
      where: {
        productId: product.id,
        moderationStatus: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    // Get related products (same category)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "ACTIVE",
        publishedAt: { lte: new Date() },
      },
      take: 8,
      include: {
        images: {
          where: { sortOrder: 0 },
          take: 1,
        },
        inventory: true,
      },
    })

    return NextResponse.json({
      product: {
        ...product,
        averageRating: ratingStats._avg.rating || 0,
        reviewCount: ratingStats._count.rating || 0,
      },
      relatedProducts,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}
