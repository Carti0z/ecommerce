"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ArrowRight, Check } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Contact
    email: "",
    phone: "",

    // Shipping
    recipientName: "",
    phone: "",
    country: "United States",
    state: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    deliveryInstructions: "",

    // Billing (same as shipping by default)
    billingSameAsShipping: true,
    billingRecipientName: "",
    billingPhone: "",
    billingCountry: "United States",
    billingState: "",
    billingCity: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingPostalCode: "",

    // Promotions
    couponCode: "",
    giftCardCode: "",
  })

  const [couponApplied, setCouponApplied] = useState<any>(null)
  const [giftCardApplied, setGiftCardApplied] = useState<any>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/cart")
      const data = await response.json()
      setCart(data)

      if (data.items.length === 0) {
        router.push("/cart")
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      return formData.email && formData.phone
    }
    if (currentStep === 2) {
      return (
        formData.recipientName &&
        formData.phone &&
        formData.country &&
        formData.state &&
        formData.city &&
        formData.addressLine1 &&
        formData.postalCode
      )
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const billingAddress = formData.billingSameAsShipping
        ? undefined
        : {
            recipientName: formData.billingRecipientName,
            phone: formData.billingPhone,
            country: formData.billingCountry,
            state: formData.billingState,
            city: formData.billingCity,
            addressLine1: formData.billingAddressLine1,
            addressLine2: formData.billingAddressLine2,
            postalCode: formData.billingPostalCode,
          }

      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: {
            recipientName: formData.recipientName,
            phone: formData.phone,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            postalCode: formData.postalCode,
            deliveryInstructions: formData.deliveryInstructions,
          },
          billingAddress,
          couponCode: formData.couponCode || undefined,
          giftCardCode: formData.giftCardCode || undefined,
          items: cart.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/checkout/payment?orderId=${data.orderId}`)
      } else {
        alert(data.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const shippingCost = cart.subtotal >= 50 ? 0 : 9.99
  const tax = cart.subtotal * 0.08
  const total = cart.subtotal + shippingCost + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <Button onClick={nextStep} className="w-full">
                    Continue to Delivery <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-country">Country</Label>
                    <Input
                      id="address-country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Input
                      id="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                      placeholder="Leave at door"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1">
                      Continue to Review <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Items ({cart.itemCount})</h3>
                    <div className="space-y-4">
                      {cart.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded" />
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.recipientName}<br />
                      {formData.addressLine1}<br />
                      {formData.addressLine2 && <>{formData.addressLine2}<br /></>}
                      {formData.city}, {formData.state} {formData.postalCode}<br />
                      {formData.country}
                    </p>
                  </div>

                  <Separator />

                  {/* Contact */}
                  <div>
                    <h3 className="font-semibold mb-2">Contact</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.email}<br />
                      {formData.phone}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                      {submitting ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
