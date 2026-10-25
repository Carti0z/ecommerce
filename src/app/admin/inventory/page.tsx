"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, AlertTriangle, Package } from "lucide-react"

export default function AdminInventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      const roles = (session as any)?.user?.roles || []
      const isAdmin = roles.some((role: any) => role.name === "ADMIN" || role.name === "SUPER_ADMIN")
      
      if (!isAdmin) {
        router.push("/")
        return
      }

      fetchInventory()
    }
  }, [status, router, session])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/products?limit=50")
      const data = await response.json()
      
      const inventoryData = data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantityOnHand: product.inventory?.quantityOnHand || 0,
        quantityReserved: product.inventory?.quantityReserved || 0,
        lowStockThreshold: product.inventory?.lowStockThreshold || 10,
        available: (product.inventory?.quantityOnHand || 0) - (product.inventory?.quantityReserved || 0),
      }))
      
      setInventory(inventoryData)
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStockStatus = (item: any) => {
    if (item.quantityOnHand === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (item.quantityOnHand <= item.lowStockThreshold) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <p>Loading inventory...</p>
        </div>
      </div>
    )
  }

  const lowStockCount = inventory.filter((item) => item.quantityOnHand <= item.lowStockThreshold).length
  const outOfStockCount = inventory.filter((item) => item.quantityOnHand === 0).length

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Inventory</h1>
          </div>
          <Button>Adjust Stock</Button>
        </div>

        {/* Alerts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">{lowStockCount} products are running low</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Out of Stock</p>
                  <p className="text-sm text-red-700">{outOfStockCount} products are out of stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Levels ({filteredInventory.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>On Hand</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.quantityOnHand}</TableCell>
                      <TableCell>{item.quantityReserved}</TableCell>
                      <TableCell className="font-medium">{item.available}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
