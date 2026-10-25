import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const addItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { sortOrder: 0 },
                  take: 1,
                },
                inventory: true,
              },
            },
            variant: {
              include: {
                inventory: true,
              },
            },
          },
        },
      },
    })

    if (!wishlist) {
      return NextResponse.json({ items: [] })
    }

    const items = wishlist.items.map((item) => {
      const price = item.variant?.priceOverride || item.product.basePrice
      const availableStock = item.variant
        ? item.variant.inventory?.quantityOnHand || 0
        : item.product.inventory?.quantityOnHand || 0

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productSku: item.product.sku,
        variantName: item.variant ? Object.values(item.variant.optionValues).join(" / ") : null,
        price: parseFloat(price.toString()),
        imageUrl: item.product.images[0]?.imageUrl,
        inStock: availableStock > 0,
        availableStock,
        addedAt: item.createdAt,
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = addItemSchema.parse(body)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          name: "My Wishlist",
        },
      })
    }

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    })

    if (existingItem) {
      return NextResponse.json({ success: true, message: "Already in wishlist" })
    }

    // Add to wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: data.productId,
        variantId: data.variantId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}
