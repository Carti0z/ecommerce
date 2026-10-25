import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import crypto from "crypto"

const validateSchema = z.object({
  code: z.string(),
})

// Simple hash function for gift card codes (in production, use proper hashing)
function hashGiftCardCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateSchema.parse(body)

    const codeHash = hashGiftCardCode(data.code)

    const giftCard = await prisma.giftCard.findFirst({
      where: {
        codeHash,
        status: "ACTIVE",
      },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: "Invalid or inactive gift card" },
        { status: 400 }
      )
    }

    // Check expiry
    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Gift card has expired" },
        { status: 400 }
      )
    }

    // Check if depleted
    if (parseFloat(giftCard.currentBalance.toString()) <= 0) {
      return NextResponse.json(
        { error: "Gift card has no remaining balance" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      balance: parseFloat(giftCard.currentBalance.toString()),
      currency: giftCard.currency,
    })
  } catch (error) {
    console.error("Error validating gift card:", error)
    return NextResponse.json(
      { error: "Failed to validate gift card" },
      { status: 500 }
    )
  }
}
