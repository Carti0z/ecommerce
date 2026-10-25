import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create roles
  console.log('Creating roles...')
  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Regular customer with shopping privileges',
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
    },
  })

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super administrator with all permissions',
    },
  })

  // Create permissions
  console.log('Creating permissions...')
  const permissions = [
    { key: 'products.read', description: 'View products' },
    { key: 'products.write', description: 'Create and edit products' },
    { key: 'products.delete', description: 'Delete products' },
    { key: 'orders.read', description: 'View orders' },
    { key: 'orders.write', description: 'Process orders' },
    { key: 'orders.delete', description: 'Delete orders' },
    { key: 'customers.read', description: 'View customers' },
    { key: 'customers.write', description: 'Manage customers' },
    { key: 'inventory.read', description: 'View inventory' },
    { key: 'inventory.write', description: 'Manage inventory' },
    { key: 'promotions.read', description: 'View promotions' },
    { key: 'promotions.write', description: 'Manage promotions' },
    { key: 'reports.read', description: 'View reports' },
    { key: 'settings.write', description: 'Manage settings' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    })
  }

  // Assign permissions to admin roles
  console.log('Assigning permissions to roles...')
  const allPermissions = await prisma.permission.findMany()

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    })

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Create admin user
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@novacart.com' },
    update: {},
    create: {
      email: 'admin@novacart.com',
      normalizedEmail: 'admin@novacart.com',
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  })

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  // Create categories
  console.log('Creating categories...')
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Books', slug: 'books', description: 'Books and educational materials' },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Toys and games for all ages' },
  ]

  const createdCategories = []
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories.push(category)
  }

  // Create brands
  console.log('Creating brands...')
  const brands = [
    { name: 'TechBrand', slug: 'techbrand' },
    { name: 'FashionCo', slug: 'fashionco' },
    { name: 'HomeStyle', slug: 'homestyle' },
    { name: 'SportPro', slug: 'sportpro' },
  ]

  const createdBrands = []
  for (const brand of brands) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    })
    createdBrands.push(createdBrand)
  }

  // Create products
  console.log('Creating products...')
  const products = [
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      sku: 'WH-001',
      shortDescription: 'Premium wireless headphones with noise cancellation',
      description: 'Experience crystal-clear audio with our premium wireless headphones. Features active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
      basePrice: 149.99,
      costPrice: 89.99,
      categoryId: createdCategories[0].id,
      brandId: createdBrands[0].id,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
    {
      name: 'Smart Watch',
      slug: 'smart-watch',
      sku: 'SW-002',
      shortDescription: 'Feature-rich smartwatch with health tracking',
      description: 'Stay connected and track your health with our smartwatch. Features heart rate monitoring, GPS, water resistance, and 7-day battery life.',
      basePrice: 299.99,
      costPrice: 179.99,
      categoryId: createdCategories[0].id,
      brandId: createdBrands[0].id,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
    {
      name: 'Premium T-Shirt',
      slug: 'premium-tshirt',
      sku: 'PT-003',
      shortDescription: '100% cotton premium t-shirt',
      description: 'Made from 100% organic cotton, this premium t-shirt offers exceptional comfort and durability. Available in multiple colors.',
      basePrice: 39.99,
      costPrice: 19.99,
      categoryId: createdCategories[1].id,
      brandId: createdBrands[1].id,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      sku: 'RS-004',
      shortDescription: 'Lightweight running shoes for athletes',
      description: 'Engineered for performance, these running shoes feature lightweight construction, responsive cushioning, and breathable mesh upper.',
      basePrice: 129.99,
      costPrice: 79.99,
      categoryId: createdCategories[3].id,
      brandId: createdBrands[3].id,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
    {
      name: 'Garden Tool Set',
      slug: 'garden-tool-set',
      sku: 'GT-005',
      shortDescription: 'Complete garden tool set for home gardening',
      description: 'Everything you need for your garden in one set. Includes trowel, cultivator, weeder, pruning shears, and more.',
      basePrice: 79.99,
      costPrice: 49.99,
      categoryId: createdCategories[2].id,
      brandId: createdBrands[2].id,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
    {
      name: 'Programming Book',
      slug: 'programming-book',
      sku: 'PB-006',
      shortDescription: 'Comprehensive guide to modern programming',
      description: 'Learn programming from scratch with this comprehensive guide. Covers fundamentals, best practices, and advanced concepts.',
      basePrice: 49.99,
      costPrice: 29.99,
      categoryId: createdCategories[4].id,
      brandId: null,
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
    createdProducts.push(createdProduct)

    // Create inventory
    await prisma.inventory.upsert({
      where: { productId: createdProduct.id },
      update: {},
      create: {
        productId: createdProduct.id,
        quantityOnHand: Math.floor(Math.random() * 100) + 10,
        quantityReserved: 0,
        lowStockThreshold: 10,
      },
    })

    // Create product images
    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        imageUrl: `/images/products/${product.slug}.jpg`,
        altText: product.name,
        sortOrder: 0,
      },
    })
  }

  // Create coupons
  console.log('Creating coupons...')
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: 50,
      maximumDiscount: 50,
      usageLimit: 1000,
      perCustomerLimit: 1,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'FLASH20' },
    update: {},
    create: {
      code: 'FLASH20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrderAmount: 100,
      maximumDiscount: 100,
      usageLimit: 500,
      perCustomerLimit: 2,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
    },
  })

  // Create flash sale promotion
  console.log('Creating promotions...')
  const flashSale = await prisma.promotion.upsert({
    where: { id: 'flash-sale-1' },
    update: {},
    create: {
      id: 'flash-sale-1',
      name: 'Flash Sale - Electronics',
      promotionType: 'FLASH_SALE',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      status: 'ACTIVE',
      configuration: {
        discountType: 'PERCENTAGE',
        discountValue: 30,
      },
    },
  })

  // Add products to flash sale
  for (let i = 0; i < 2; i++) {
    await prisma.promotionProduct.upsert({
      where: {
        promotionId_productId: {
          promotionId: flashSale.id,
          productId: createdProducts[i].id,
        },
      },
      update: {},
      create: {
        promotionId: flashSale.id,
        productId: createdProducts[i].id,
        discountType: 'PERCENTAGE',
        discountValue: 30,
        stockLimit: 50,
      },
    })
  }

  // Create store settings
  console.log('Creating store settings...')
  const settings = [
    { key: 'store_name', value: 'NovaCart' },
    { key: 'store_currency', value: 'USD' },
    { key: 'store_locale', value: 'en-US' },
    { key: 'enable_crypto_payments', value: false },
    { key: 'enable_gift_cards', value: true },
    { key: 'enable_flash_sales', value: true },
    { key: 'minimum_order_amount', value: 0 },
  ]

  for (const setting of settings) {
    await prisma.storeSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ Database seed completed successfully!')
  console.log('📧 Admin credentials: admin@novacart.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
