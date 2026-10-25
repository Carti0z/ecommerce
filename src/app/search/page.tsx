"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search as SearchIcon } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q") || ""
  const [query, setQuery] = useState(queryParam)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam)
    }
  }, [queryParam])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, categories, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : results ? (
        <div>
          {/* Categories */}
          {results.categories && results.categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.categories.map((category: any) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{category.name}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {results.brands && results.brands.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Brands</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.brands.map((brand: any) => (
                  <Link key={brand.id} href={`/shop?brand=${brand.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{brand.name}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Products ({results.pagination.total})
            </h2>
            {results.products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No products found for "{results.query}"
                  </p>
                  <Button onClick={() => setQuery("")}>Clear Search</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    shortDescription={product.shortDescription}
                    basePrice={parseFloat(product.basePrice)}
                    imageUrl={product.images[0]?.imageUrl}
                    averageRating={product.averageRating}
                    reviewCount={product._count.reviews}
                    inStock={product.inventory?.quantityOnHand > 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : queryParam ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search term to find products</p>
        </div>
      ) : null}
    </div>
  )
}
