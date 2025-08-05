# Livrili - B2B Marketplace Platform

Livrili is a B2B marketplace platform connecting retailers and suppliers in Algeria. The platform consists of two main applications built with modern web technologies.

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **API**: tRPC v11
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + Shadcn/ui
- **PWA**: next-pwa + Workbox
- **Language**: TypeScript (strict mode)

### Project Structure
```
livrili-app/
├── apps/
│   ├── admin-portal/    # Desktop-first admin interface
│   └── retail-portal/   # Mobile-first retailer PWA
├── packages/
│   ├── ui/              # Shared UI components
│   ├── database/        # Supabase client & types
│   ├── api/             # tRPC router & procedures
│   ├── auth/            # Authentication utilities
│   ├── i18n/            # Internationalization
│   └── utils/           # Shared utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/livrili-app.git
cd livrili-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env files
cp apps/admin-portal/.env.example apps/admin-portal/.env.local
cp apps/retail-portal/.env.example apps/retail-portal/.env.local

# Add your Supabase credentials
```

4. Run the development servers:
```bash
npm run dev
```

This will start:
- Admin Portal: http://localhost:3001
- Retail Portal: http://localhost:3002

## 📱 Applications

### Admin Portal
Internal operations management system for Livrili staff.
- **URL**: http://localhost:3001
- **Features**: User management, order processing, analytics, inventory control

### Retail Portal
Customer-facing PWA for retailers to place orders.
- **URL**: http://localhost:3002
- **Features**: Product browsing, order placement, account management, offline support

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Run ESLint across the monorepo
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Adding UI Components

The UI package uses Shadcn/ui. To add new components:

```bash
cd packages/ui
npx shadcn-ui@latest add [component-name]
```

### Database Migrations

```bash
cd packages/database
npm run generate  # Generate types from Supabase
```

## 🌍 Internationalization

The platform supports three languages:
- English (en)
- Arabic (ar) - with RTL support
- French (fr)

Language files are located in `packages/i18n/locales/`.

## 🔧 Configuration

### Environment Variables

Each app requires the following environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App-specific
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 📦 Deployment

### Production Build

```bash
npm run build
```

### Deployment Platforms

- **Recommended**: Vercel (optimized for Next.js)
- **Database**: Supabase Cloud
- **CDN**: Cloudflare or AWS CloudFront

## 🧪 Testing

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

## 📞 Support

For support, email support@livrili.shop or join our Discord server.