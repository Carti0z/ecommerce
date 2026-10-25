import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const applySchema = z.object({
  code: z.string(),
  subtotal: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = applySchema.parse(body)

    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code, isActive: true },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      )
    }

    const now = new Date()

    // Check dates
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json(
        { error: "Coupon is not yet active" },
        { status: 400 }
      )
    }

    if (coupon.endsAt && coupon.endsAt < now) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && data.subtotal < parseFloat(coupon.minimumOrderAmount.toString())) {
      return NextResponse.json(
        { error: `Minimum order amount is ${coupon.minimumOrderAmount}` },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === "PERCENTAGE") {
      discount = data.subtotal * (parseFloat(coupon.discountValue.toString()) / 100)
      if (coupon.maximumDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maximumDiscount.toString()))
      }
    } else {
      discount = parseFloat(coupon.discountValue.toString())
    }

    return NextResponse.json({
      success: true,
      discount,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue.toString()),
      maximumDiscount: coupon.maximumDiscount ? parseFloat(coupon.maximumDiscount.toString()) : null,
    })
  } catch (error) {
    console.error("Error applying coupon:", error)
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    )
  }
}
