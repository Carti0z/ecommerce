"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/orders")
      const data = await response.json()
      const foundOrder = data.orders.find((o: any) => o.id === params.id)
      setOrder(foundOrder)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5" />
      case "PROCESSING":
        return <Package className="h-5 w-5" />
      case "SHIPPED":
        return <Truck className="h-5 w-5" />
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => router.push("/account/orders")} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/account/orders")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <h1 className="text-3xl font-bold mb-8">Order Details</h1>

        {/* Order Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                  <Badge className={getStatusColor(order.fulfilmentStatus)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.fulfilmentStatus)}
                      {order.fulfilmentStatus}
                    </div>
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{formatPrice(parseFloat(order.grandTotal))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productNameSnapshot}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.skuSnapshot}</p>
                    </div>
                    <p className="font-medium">{formatPrice(parseFloat(item.lineTotal))}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(parseFloat(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatPrice(parseFloat(order.discountTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gift Card</span>
                <span>-{formatPrice(parseFloat(order.giftCardTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(parseFloat(order.shippingTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(parseFloat(order.taxTotal))}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(parseFloat(order.grandTotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof order.shippingAddressSnapshot === "object" ? (
              <div className="text-sm">
                <p className="font-medium">{order.shippingAddressSnapshot.recipientName}</p>
                <p>{order.shippingAddressSnapshot.phone}</p>
                <p>{order.shippingAddressSnapshot.addressLine1}</p>
                {order.shippingAddressSnapshot.addressLine2 && (
                  <p>{order.shippingAddressSnapshot.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state}{" "}
                  {order.shippingAddressSnapshot.postalCode}
                </p>
                <p>{order.shippingAddressSnapshot.country}</p>
                {order.shippingAddressSnapshot.deliveryInstructions && (
                  <p className="mt-2 text-muted-foreground">
                    Instructions: {order.shippingAddressSnapshot.deliveryInstructions}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Address details unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/shop")}>
            Shop More
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print Order
          </Button>
        </div>
      </div>
    </div>
  )
}
