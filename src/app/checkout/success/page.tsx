"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home, Package, ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="font-medium capitalize">{order.paymentStatus.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">{formatPrice(parseFloat(order.grandTotal))}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  {typeof order.shippingAddressSnapshot === "object" ? (
                    <>
                      <p>{order.shippingAddressSnapshot.recipientName}</p>
                      <p>{order.shippingAddressSnapshot.addressLine1}</p>
                      {order.shippingAddressSnapshot.addressLine2 && (
                        <p>{order.shippingAddressSnapshot.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state}{" "}
                        {order.shippingAddressSnapshot.postalCode}
                      </p>
                      <p>{order.shippingAddressSnapshot.country}</p>
                    </>
                  ) : (
                    <p>Address details will be available soon</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productNameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(parseFloat(item.lineTotal))}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1" onClick={() => router.push("/account/orders")}>
            <Package className="h-4 w-4 mr-2" />
            View Order Details
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5" />
              <span>You'll receive an email confirmation with your order details</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5" />
              <span>We'll notify you when your order ships</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5" />
              <span>You can track your order status in your account</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
