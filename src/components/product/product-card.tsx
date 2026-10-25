"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  id: string
  slug: string
  name: string
  shortDescription?: string
  basePrice: number
  imageUrl?: string
  averageRating: number
  reviewCount: number
  inStock: boolean
}

export function ProductCard({
  id,
  slug,
  name,
  shortDescription,
  basePrice,
  imageUrl,
  averageRating,
  reviewCount,
  inStock,
}: ProductCardProps) {
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${name} has been added to your cart`,
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to wishlist",
          description: `${name} has been added to your wishlist`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-4">
        <Link href={`/products/${slug}`} className="block">
          <div className="relative aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                📦
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          {shortDescription && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {shortDescription}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold">{formatPrice(basePrice)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              ⭐ {averageRating.toFixed(1)}
            </span>
            <span>({reviewCount} reviews)</span>
          </div>
          <div className="mt-3">
            <Button
              className="w-full"
              disabled={!inStock}
              variant={inStock ? "default" : "secondary"}
              onClick={handleAddToCart}
            >
              {inStock ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              ) : (
                "Out of Stock"
              )}
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
