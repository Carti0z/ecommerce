import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = updateItemSchema.parse(body)

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        cart: true,
        product: {
          include: { inventory: true },
        },
        variant: {
          include: { inventory: true },
        },
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Verify ownership
    if (session?.user?.id) {
      if (cartItem.cart.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else {
      const sessionToken = request.cookies.get("cart_session")?.value
      if (cartItem.cart.sessionTokenHash !== sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Check stock
    const inventory = cartItem.variantId
      ? cartItem.variant?.inventory
      : cartItem.product.inventory

    if (!inventory || inventory.quantityOnHand < data.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      )
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity: data.quantity },
    })

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Verify ownership
    if (session?.user?.id) {
      if (cartItem.cart.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else {
      const sessionToken = request.cookies.get("cart_session")?.value
      if (cartItem.cart.sessionTokenHash !== sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting cart item:", error)
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    )
  }
}
