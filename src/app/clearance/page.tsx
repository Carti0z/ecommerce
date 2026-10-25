"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ClearancePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClearanceProducts()
  }, [])

  const fetchClearanceProducts = async () => {
    setLoading(true)
    try {
      // In production, this would fetch from a clearance API endpoint
      // For now, we'll fetch all products and simulate clearance pricing
      const response = await fetch("/api/v1/products?limit=12")
      const data = await response.json()
      
      // Add clearance discount to products
      const clearanceProducts = data.products.map((product: any) => ({
        ...product,
        originalPrice: parseFloat(product.basePrice),
        discountPercent: 40,
        discountedPrice: parseFloat(product.basePrice) * 0.6,
        condition: "New",
      }))
      
      setProducts(clearanceProducts)
    } catch (error) {
      console.error("Error fetching clearance products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Loading clearance items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Clearance Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-8 mb-8">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-12 w-12" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Clearance Sale</h1>
            <p className="text-lg opacity-90">Final clearance - up to 70% off</p>
          </div>
        </div>
      </div>

      {/* Clearance Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Clearance Items</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No clearance items available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  CLEARANCE
                </div>
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
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
                    <span className="text-lg font-bold text-orange-600">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Condition: {product.condition}
                  </div>
                  <Button className="w-full" variant="outline">
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
          <h3 className="font-semibold mb-4">Clearance Terms</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• All clearance items are final sale</li>
            <li>• No returns or exchanges on clearance items</li>
            <li>• Limited quantities available</li>
            <li>• While supplies last</li>
            <li>• Some items may have minor cosmetic imperfections</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
