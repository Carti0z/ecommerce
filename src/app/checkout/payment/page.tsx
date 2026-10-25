"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Bitcoin, Gift, Loader2, CheckCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState("")
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/orders`)
      const data = await response.json()
      const foundOrder = data.orders.find((o: any) => o.id === orderId)
      setOrder(foundOrder)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateGiftCard = async () => {
    try {
      const response = await fetch("/api/v1/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCardCode }),
      })

      const data = await response.json()

      if (data.valid) {
        setGiftCardBalance(data.balance)
      } else {
        alert(data.error)
        setGiftCardBalance(null)
      }
    } catch (error) {
      alert("Failed to validate gift card")
    }
  }

  const handleCardPayment = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/v1/payments/card/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: parseFloat(order.grandTotal),
          currency: order.currency,
          email: order.customerEmail,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // In production, redirect to payment provider
        // For now, simulate payment success
        setPaymentSuccess(true)
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${order.id}`)
        }, 2000)
      } else {
        alert(data.error || "Failed to initialize payment")
      }
    } catch (error) {
      alert("Failed to initialize payment")
    } finally {
      setProcessing(false)
    }
  }

  const handleCryptoPayment = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/v1/payments/crypto/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: parseFloat(order.grandTotal),
          currency: order.currency,
          email: order.customerEmail,
          asset: "BTC",
          network: "bitcoin",
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // In production, redirect to crypto payment page
        // For now, simulate payment success
        setPaymentSuccess(true)
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${order.id}`)
        }, 2000)
      } else {
        alert(data.error || "Failed to initialize payment")
      }
    } catch (error) {
      alert("Failed to initialize payment")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => router.push("/cart")} className="mt-4">
            Return to Cart
          </Button>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-4">Redirecting to confirmation...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Bitcoin className="h-5 w-5" />
                        <span>Cryptocurrency</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="gift-card" id="gift-card" />
                    <Label htmlFor="gift-card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        <span>Gift Card</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Gift Card Input */}
                {paymentMethod === "gift-card" && (
                  <div className="space-y-2">
                    <Label htmlFor="gift-card-code">Gift Card Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="gift-card-code"
                        placeholder="Enter gift card code"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                      />
                      <Button onClick={validateGiftCard} variant="outline">
                        Validate
                      </Button>
                    </div>
                    {giftCardBalance !== null && (
                      <p className="text-sm text-green-600">
                        Gift card balance: {formatPrice(giftCardBalance)}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={
                    paymentMethod === "card"
                      ? handleCardPayment
                      : paymentMethod === "crypto"
                      ? handleCryptoPayment
                      : () => alert("Gift card payment requires additional setup")
                  }
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatPrice(parseFloat(order.grandTotal))}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span>{formatPrice(parseFloat(order.grandTotal))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total to Pay</span>
                  <span>{formatPrice(parseFloat(order.grandTotal))}</span>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>Order Number: {order.orderNumber}</p>
                  <p>Email: {order.customerEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment information is secure and encrypted. We never store your full card details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
