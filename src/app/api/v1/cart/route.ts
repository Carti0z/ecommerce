import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

const addItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Get or create cart
    let cart
    if (session?.user?.id) {
      cart = await prisma.cart.findFirst({
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

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: session.user.id,
            currency: "USD",
          },
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
      }
    } else {
      // Guest cart - using session token from cookie
      const sessionToken = request.cookies.get("cart_session")?.value
      if (!sessionToken) {
        return NextResponse.json({ items: [], subtotal: 0 })
      }

      cart = await prisma.cart.findFirst({
        where: { sessionTokenHash: sessionToken },
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
    }

    if (!cart) {
      return NextResponse.json({ items: [], subtotal: 0 })
    }

    // Calculate totals
    let subtotal = 0
    const items = cart.items.map((item) => {
      const price = item.variant?.priceOverride || item.product.basePrice
      const lineTotal = parseFloat(price.toString()) * item.quantity
      subtotal += lineTotal

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
        quantity: item.quantity,
        lineTotal,
        imageUrl: item.product.images[0]?.imageUrl,
        inStock: availableStock >= item.quantity,
        availableStock,
      }
    })

    return NextResponse.json({
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = addItemSchema.parse(body)

    // Get or create cart
    let cart
    if (session?.user?.id) {
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
      })

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: session.user.id,
            currency: "USD",
          },
        })
      }
    } else {
      // Guest cart
      let sessionToken = request.cookies.get("cart_session")?.value
      if (!sessionToken) {
        sessionToken = uuidv4()
      }

      cart = await prisma.cart.findFirst({
        where: { sessionTokenHash: sessionToken },
      })

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            sessionTokenHash: sessionToken,
            currency: "USD",
          },
        })
      }
    }

    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        inventory: true,
        variants: {
          where: { id: data.variantId },
          include: { inventory: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const inventory = data.variantId
      ? product.variants[0]?.inventory
      : product.inventory

    if (!inventory || inventory.quantityOnHand < data.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      )
    }

    // Add or update cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity
      if (inventory.quantityOnHand < newQuantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        )
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
      })
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}
