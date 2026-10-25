"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Trash2, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/wishlist")
      if (response.ok) {
        const data = await response.json()
        setWishlist(data)
      } else {
        setWishlist({ items: [] })
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      setWishlist({ items: [] })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      await fetch(`/api/v1/wishlist/${itemId}`, {
        method: "DELETE",
      })
      await fetchWishlist()
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save products you love to your wishlist
          </p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlist.items.length} items)</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.items.map((item: any) => (
          <Card key={item.id} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => removeFromWishlist(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="p-4">
              <Link href={`/products/${item.productSlug}`}>
                <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary">
                  {item.productName}
                </h3>
                {item.variantName && (
                  <p className="text-sm text-muted-foreground mb-2">{item.variantName}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  {!item.inStock && (
                    <span className="text-sm text-destructive">Out of Stock</span>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
