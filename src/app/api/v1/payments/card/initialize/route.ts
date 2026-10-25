import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { getPaymentProvider } from "@/lib/payment/providers"

const initSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  currency: z.string(),
  email: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = initSchema.parse(body)

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (session?.user?.id && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (order.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Order already paid or cancelled" },
        { status: 400 }
      )
    }

    // Check for existing payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: data.orderId,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    })

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        reference: existingPayment.idempotencyKey,
        paymentUrl: existingPayment.providerMetadata?.paymentUrl,
      })
    }

    // Generate idempotency key
    const idempotencyKey = uuidv4()

    // Initialize payment with provider
    const provider = getPaymentProvider("card")
    const initResult = await provider.initializePayment({
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      orderId: data.orderId,
      orderNumber: order.orderNumber,
    })

    if (!initResult.success) {
      return NextResponse.json(
        { error: initResult.error || "Failed to initialize payment" },
        { status: 500 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        provider: "card",
        providerReference: initResult.providerReference,
        paymentMethod: "CARD",
        currency: data.currency,
        amount: data.amount,
        status: "PENDING",
        idempotencyKey,
        providerMetadata: {
          paymentUrl: initResult.paymentUrl,
        },
        initiatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference: idempotencyKey,
      paymentUrl: initResult.paymentUrl,
    })
  } catch (error) {
    console.error("Error initializing card payment:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
