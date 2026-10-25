import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, TrendingUp, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Premium Products
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Shop the latest trends with confidence. Quality products, great prices, and exceptional service.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/deals">View Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Electronics", slug: "electronics", color: "bg-blue-100" },
              { name: "Clothing", slug: "clothing", color: "bg-pink-100" },
              { name: "Home & Garden", slug: "home-garden", color: "bg-green-100" },
              { name: "Sports", slug: "sports-outdoors", color: "bg-orange-100" },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className={`${category.color} h-32 rounded-lg mb-4 flex items-center justify-center`}>
                      <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-destructive" />
              <h2 className="text-3xl font-bold">Flash Sale</h2>
            </div>
            <div className="flex items-center gap-2 text-2xl font-mono">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded">02</span>
              <span>:</span>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded">45</span>
              <span>:</span>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded">30</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="bg-muted h-48 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🛍️</span>
                  </div>
                  <h3 className="font-semibold mb-2">Product {i}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-destructive">$49.99</span>
                    <span className="text-sm text-muted-foreground line-through">$79.99</span>
                  </div>
                  <div className="mt-2 text-sm text-destructive font-medium">
                    37% OFF
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/flash-sale">
                View All Flash Deals <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Clearance Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold">Clearance Sale</h2>
            <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded">Up to 70% OFF</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="bg-muted h-48 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🏷️</span>
                  </div>
                  <h3 className="font-semibold mb-2">Clearance Item {i}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-600">$29.99</span>
                    <span className="text-sm text-muted-foreground line-through">$59.99</span>
                  </div>
                  <div className="mt-2 text-sm text-orange-600 font-medium">
                    50% OFF
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/clearance">
                Shop Clearance <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Bestsellers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden group">
                <CardContent className="p-4">
                  <div className="bg-muted h-48 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <h3 className="font-semibold mb-2">Bestseller {i}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">$99.99</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    ⭐⭐⭐⭐⭐ (128 reviews)
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    NEW
                  </div>
                  <div className="bg-muted h-48 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="font-semibold mb-2">New Product {i}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">$129.99</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  On orders over $50
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  100% secure checkout
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">↩️</div>
                <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">
                  30-day return policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
