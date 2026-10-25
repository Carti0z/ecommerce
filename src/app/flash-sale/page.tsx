"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product/product-card"
import { CountdownTimer } from "@/components/countdown-timer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function FlashSalePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [endDate] = useState(() => {
    // Flash sale ends in 48 hours from now
    return new Date(Date.now() + 48 * 60 * 60 * 1000)
  })

  useEffect(() => {
    fetchFlashSaleProducts()
  }, [])

  const fetchFlashSaleProducts = async () => {
    setLoading(true)
    try {
      // In production, this would fetch from a flash sale API endpoint
      // For now, we'll fetch all products and simulate flash sale pricing
      const response = await fetch("/api/v1/products?limit=8")
      const data = await response.json()
      
      // Add flash sale discount to products
      const flashSaleProducts = data.products.map((product: any) => ({
        ...product,
        originalPrice: parseFloat(product.basePrice),
        discountPercent: 30,
        discountedPrice: parseFloat(product.basePrice) * 0.7,
      }))
      
      setProducts(flashSaleProducts)
    } catch (error) {
      console.error("Error fetching flash sale products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    alert("Flash sale has ended!")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Loading flash sale...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Flash Sale Header */}
      <div className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">⚡ Flash Sale</h1>
            <p className="text-lg opacity-90">Up to 50% off selected items</p>
          </div>
          <CountdownTimer targetDate={endDate} onComplete={handleComplete} />
        </div>
      </div>

      {/* Flash Sale Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Flash Sale Deals</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No flash sale items available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded font-semibold">
                  -{product.discountPercent}%
                </div>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    {product.images[0]?.imageUrl ? (
                      <img
                        src={product.images[0].imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-destructive">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full" variant="destructive">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Terms */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Flash Sale Terms</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Flash sale ends when timer reaches zero</li>
            <li>• Discounts apply only to eligible products</li>
            <li>• Limited stock available - first come, first served</li>
            <li>• Cannot be combined with other promotions</li>
            <li>• All sales are final on flash sale items</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
