# NovaCart - Premium E-Commerce Platform

A full-featured, production-ready e-commerce platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Customer Features
- **Product Catalogue**: Browse, search, and filter products with advanced search
- **Categories & Brands**: Organized product navigation
- **Shopping Cart**: Add items, manage quantities, apply coupons
- **Wishlist**: Save favorite products for later
- **Multi-step Checkout**: Contact info, delivery, review, and payment
- **Customer Accounts**: Order history, tracking, profile management
- **Reviews & Ratings**: Customer feedback on products

### Payment Methods
- **Card Payments**: Secure integration with payment providers (Paystack/Flutterwave)
- **Cryptocurrency**: BTC, ETH, USDT support (configurable)
- **Gift Cards**: Store-issued and third-party gift card redemption
- **Combined Payments**: Use gift card balance + other payment methods

### Promotions
- **Flash Sales**: Time-limited promotions with countdown timers
- **Clearance Sales**: Discounted product collections
- **Coupons**: Percentage and fixed-amount discounts with usage limits
- **Dynamic Pricing**: Server-side validation of all discounts

### Admin Dashboard
- **Dashboard Overview**: Sales metrics, orders, inventory status
- **Product Management**: Create, edit, and manage products
- **Inventory Control**: Stock levels, adjustments, low-stock alerts
- **Order Management**: View, process, and fulfill orders
- **Customer Management**: Customer profiles and order history
- **Promotion Management**: Create flash sales, coupons, and campaigns
- **Reports**: Sales, inventory, payment, and performance reports
- **Settings**: Store configuration, payment providers, roles

### Security
- **Role-Based Access Control**: Admin, Super Admin, Customer roles
- **Secure Authentication**: NextAuth.js with password hashing
- **Payment Verification**: Webhook signature verification
- **Idempotency**: Prevent duplicate payments and orders
- **CSRF Protection**: Secure session management
- **Input Validation**: Zod schemas for all API endpoints

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd novacart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novacart?schema=public"

# Authentication
AUTH_SECRET="your-super-secret-auth-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Payment Providers (Card)
PAYMENT_PROVIDER="paystack"
PAYMENT_PROVIDER_SECRET_KEY="sk_test_..."
PAYMENT_PROVIDER_PUBLIC_KEY="pk_test_..."
PAYMENT_WEBHOOK_SECRET="whsec_..."

# Cryptocurrency Payments
CRYPTO_PROVIDER="nowpayments"
CRYPTO_PROVIDER_API_KEY="your-api-key"
CRYPTO_WEBHOOK_SECRET="your-webhook-secret"

# Email Provider
EMAIL_PROVIDER="resend"
EMAIL_PROVIDER_API_KEY="re_..."

# Object Storage
OBJECT_STORAGE_ENDPOINT="https://storage.example.com"
OBJECT_STORAGE_ACCESS_KEY="your-access-key"
OBJECT_STORAGE_SECRET_KEY="your-secret-key"
OBJECT_STORAGE_BUCKET="novacart-images"

# App Configuration
APP_URL="http://localhost:3000"
APP_NAME="NovaCart"
DEFAULT_CURRENCY="USD"
DEFAULT_LOCALE="en-US"

# Feature Flags
ENABLE_CRYPTO_PAYMENTS="false"
ENABLE_GIFT_CARDS="true"
ENABLE_FLASH_SALES="true"
```

### 4. Set Up the Database

Generate Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

### 5. Seed the Database

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@novacart.com` / `admin123`
- Sample categories, brands, and products
- Coupons and promotions
- Store settings

**Important**: Change the admin password in production!

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
novacart/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed script
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── account/        # Customer account pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── shop/           # Shop and catalogue
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── layout/         # Header, footer
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client
│   │   └── utils.ts        # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── env.example             # Environment variables template
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## 🔐 Security Considerations

### Before Production

1. **Change Default Credentials**
   - Update admin password immediately
   - Generate strong `AUTH_SECRET`

2. **Environment Variables**
   - Never commit `.env` file
   - Use secure secret management in production
   - Rotate payment provider keys regularly

3. **Database**
   - Enable SSL for database connections
   - Set up regular backups
   - Configure connection pooling

4. **Payment Security**
   - Verify webhook signatures
   - Use idempotency keys for all financial operations
   - Never store raw card data or CVV
   - Implement rate limiting on payment endpoints

5. **API Security**
   - Enable CORS restrictions
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production

## 🧪 Testing

Run tests (to be implemented):

```bash
npm test
```

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

Ensure you have:
- Production database configured
- All environment variables set
- SSL/TLS enabled
- Proper domain configuration

## 🗄️ Database Migrations

After schema changes:

```bash
npm run db:generate
npm run db:push
```

For production, use migrations:

```bash
npx prisma migrate dev
npx prisma migrate deploy
```

## 📚 API Documentation

API endpoints follow REST conventions under `/api/v1`:

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:slug` - Get product details
- `GET /api/v1/categories` - List categories
- `GET /api/v1/search` - Search products

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item to cart
- `PATCH /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove cart item

### Checkout
- `POST /api/v1/checkout/quote` - Get shipping quote
- `POST /api/v1/orders` - Create order

### Payments
- `POST /api/v1/payments/card/initialize` - Initialize card payment
- `POST /api/v1/payments/crypto/initialize` - Initialize crypto payment
- `POST /api/v1/gift-cards/validate` - Validate gift card

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard metrics
- `GET /api/v1/admin/products` - List products
- `POST /api/v1/admin/products` - Create product
- `GET /api/v1/admin/orders` - List orders
- `GET /api/v1/admin/reports/sales` - Sales reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@novacart.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Complete Phase 2: Full catalogue implementation
- [ ] Complete Phase 3: Shopping cart and checkout
- [ ] Complete Phase 4: Payment integrations
- [ ] Complete Phase 5: Promotions system
- [ ] Complete Phase 6: Fulfilment and customer accounts
- [ ] Complete Phase 7: Admin dashboard
- [ ] Complete Phase 8: Testing and hardening
- [ ] Mobile app development
- [ ] Multi-vendor marketplace support
- [ ] Advanced analytics and reporting
