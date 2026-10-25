import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { randomBytes } from "crypto"

const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  shippingAddress: z.object({
    recipientName: z.string(),
    phone: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    postalCode: z.string(),
    deliveryInstructions: z.string().optional(),
  }),
  billingAddress: z.object({
    recipientName: z.string(),
    phone: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    postalCode: z.string(),
  }).optional(),
  couponCode: z.string().optional(),
  giftCardCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Generate order number
      const randomSuffix = randomBytes(5).toString("hex").toUpperCase()
      const orderNumber = `ORD-${Date.now()}-${randomSuffix}`

      // Validate and calculate items
      let subtotal = 0
      const orderItems = []

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            inventory: true,
            variants: {
              where: { id: item.variantId },
              include: { inventory: true },
            },
          },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.status !== "ACTIVE") {
          throw new Error(`Product ${item.productId} is not available`)
        }

        const inventory = item.variantId
          ? product.variants[0]?.inventory
          : product.inventory

        if (!inventory || inventory.quantityOnHand < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        const price = item.variantId
          ? product.variants[0]?.priceOverride || product.basePrice
          : product.basePrice

        const lineTotal = parseFloat(price.toString()) * item.quantity
        subtotal += lineTotal

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          variantSnapshot: item.variantId
            ? product.variants[0]?.optionValues
            : null,
          unitPrice: parseFloat(price.toString()),
          quantity: item.quantity,
          lineTotal,
          costSnapshot: product.costPrice || null,
        })

        // Reserve inventory
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantityOnHand: { decrement: item.quantity },
            quantityReserved: { increment: item.quantity },
          },
        })

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            movementType: "SALE",
            quantityDelta: -item.quantity,
            reason: "Order placement",
            referenceType: "ORDER",
            referenceId: orderNumber,
            createdBy: session?.user?.id || null,
          },
        })
      }

      // Apply coupon discount
      let discountTotal = 0
      let couponId = null

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode, isActive: true },
        })

        if (coupon) {
          const now = new Date()
          if (
            (!coupon.startsAt || coupon.startsAt <= now) &&
            (!coupon.endsAt || coupon.endsAt >= now)
          ) {
            if (!coupon.minimumOrderAmount || subtotal >= parseFloat(coupon.minimumOrderAmount.toString())) {
              let discount = 0
              if (coupon.discountType === "PERCENTAGE") {
                discount = subtotal * (parseFloat(coupon.discountValue.toString()) / 100)
                if (coupon.maximumDiscount) {
                  discount = Math.min(discount, parseFloat(coupon.maximumDiscount.toString()))
                }
              } else {
                discount = parseFloat(coupon.discountValue.toString())
              }
              discountTotal = discount
              couponId = coupon.id
            }
          }
        }
      }

      // Apply gift card
      let giftCardTotal = 0
      if (data.giftCardCode) {
        const giftCard = await tx.giftCard.findFirst({
          where: {
            codeHash: data.giftCardCode,
            status: "ACTIVE",
          },
        })

        if (giftCard) {
          const giftCardBalance = parseFloat(giftCard.currentBalance.toString())
          const remainingAfterDiscount = subtotal - discountTotal
          giftCardTotal = Math.min(giftCardBalance, remainingAfterDiscount)
        }
      }

      // Calculate totals
      const shippingTotal = subtotal >= 50 ? 0 : 9.99 // Free shipping over $50
      const taxTotal = (subtotal - discountTotal - giftCardTotal) * 0.08 // 8% tax
      const grandTotal = subtotal - discountTotal - giftCardTotal + shippingTotal + taxTotal

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          currency: "USD",
          subtotal,
          discountTotal,
          giftCardTotal,
          shippingTotal,
          taxTotal,
          grandTotal,
          paymentStatus: "PENDING",
          fulfilmentStatus: "PENDING",
          shippingAddressSnapshot: data.shippingAddress,
          billingAddressSnapshot: data.billingAddress || data.shippingAddress,
          couponId,
          items: {
            create: orderItems,
          },
        },
      })

      // Create order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: null,
          newStatus: "PENDING",
          reason: "Order created",
          changedBy: session?.user?.id || null,
        },
      })

      // Record coupon redemption
      if (couponId) {
        await tx.couponRedemption.create({
          data: {
            couponId,
            userId: session?.user?.id || null,
            orderId: order.id,
            discountAmount: discountTotal,
          },
        })
      }

      // Record gift card transaction
      if (data.giftCardCode && giftCardTotal > 0) {
        const giftCard = await tx.giftCard.findFirst({
          where: { codeHash: data.giftCardCode },
        })

        if (giftCard) {
          await tx.giftCardTransaction.create({
            data: {
              giftCardId: giftCard.id,
              orderId: order.id,
              type: "REDEMPTION",
              amount: giftCardTotal,
              status: "COMPLETED",
              idempotencyKey: uuidv4(),
              reason: "Order payment",
            },
          })

          await tx.giftCard.update({
            where: { id: giftCard.id },
            data: {
              currentBalance: { decrement: giftCardTotal },
            },
          })
        }
      }

      return order
    })

    return NextResponse.json({
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      grandTotal: result.grandTotal,
    })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            take: 3,
          },
        },
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
