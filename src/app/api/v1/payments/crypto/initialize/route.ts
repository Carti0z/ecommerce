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
  asset: z.string().default("BTC"),
  network: z.string().default("bitcoin"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = initSchema.parse(body)

    // Verify order exists
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
        paymentMethod: "CRYPTO",
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
    const provider = getPaymentProvider("crypto")
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
        provider: "crypto",
        providerReference: initResult.providerReference,
        paymentMethod: "CRYPTO",
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

    // Create crypto payment details
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    await prisma.cryptoPaymentDetails.create({
      data: {
        paymentId: payment.id,
        asset: data.asset,
        network: data.network,
        expectedAmount: data.amount, // In production, this would be converted from USD
        destinationReference: initResult.providerReference,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference: idempotencyKey,
      paymentUrl: initResult.paymentUrl,
      asset: data.asset,
      network: data.network,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Error initializing crypto payment:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
