# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Livrili is a B2B e-commerce platform for Algeria, built as a monorepo using Turborepo with two main applications:
- **Admin Portal** (port 3001): Internal management system for staff
- **Retail Portal** (port 3002): PWA for retailers to place orders

## Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5.7.2
- **Database**: Supabase (PostgreSQL)
- **API**: tRPC v11
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth
- **Monorepo**: Turborepo with npm workspaces

## Essential Commands

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev:force       # Clean start (removes .next, dist, cache)

# Individual apps
cd apps/admin-portal && npm run dev     # Admin portal only (port 3001)
cd apps/retail-portal && npm run dev    # Retail portal only (port 3002)

# Build & Production
npm run build           # Build all apps
npm run typecheck      # Type check entire monorepo
npm run lint           # Lint all packages
npm run format         # Format code with Prettier

# Clean
npm run clean          # Clean all build artifacts and node_modules
```

## Architecture

### Monorepo Structure
```
apps/
  admin-portal/        # Next.js admin dashboard
  retail-portal/       # Next.js PWA for retailers
packages/
  api/                # tRPC API routers and business logic
  auth/               # Shared authentication utilities
  database/           # Supabase client and types
  ui/                 # Shared UI components
  utils/              # Shared utilities
  i18n/               # Internationalization
```

### API Architecture (tRPC)

The API uses tRPC with routers organized by domain:
- **Retailer-specific routers**: `retailer.profile`, `retailer.cart`, `retailer.products`, `retailer.orders`, `retailer.signup`
- **Admin routers**: `users`, `products`, `categories`, `retailers`, `orders`, `analytics`, `payments`, `deliveries`, `suppliers`
- **Shared routers**: `communications`, `intelligence`, `reports`, `tags`

API entry point: `packages/api/src/root.ts`

### Database

Using Supabase with PostgreSQL. Key tables include:
- `retailers`: Store/retailer information
- `products`: Product catalog
- `categories`: Product categories
- `orders`: Order management
- `order_items`: Order line items
- `users`: System users (admin staff)

## Development Guidelines

### When Using Sub-Agents
Always leverage sub-agents for:
- Complex multi-file refactoring
- Performance optimization analysis
- Security audits
- Test generation and fixes
- Documentation updates across multiple files

### When Using MCPs
1. **Supabase MCP**: Use for all database operations (schema changes, data manipulation, queries)
2. **Web Development MCPs**: Use for browser testing, performance audits, SEO analysis
3. **Testing MCPs**: Use for E2E testing, accessibility testing, visual regression

### Important Principles
1. **No backward compatibility**: Always implement fresh, modern approaches
2. **No migration plans**: Unless explicitly requested, implement changes directly
3. **Use latest patterns**: Leverage Next.js 15 App Router, React 19, server components
4. **Prefer server-side**: Use server components and server actions where possible

### Authentication Flow
- Supabase Auth handles all authentication
- Admin portal: Email/password for staff (role: 'admin')
- Retail portal: Email/password for retailers (role: 'retailer')
- Auth state managed via Supabase SSR package
- Role-based access control via user_profiles table

### State Management
- Server state: tRPC with React Query
- Client state: React hooks and context where needed
- Form state: React Hook Form with Zod validation

### Styling Conventions
- Tailwind CSS for all styling
- Component variants using class-variance-authority (CVA)
- Responsive design with mobile-first approach
- Dark mode support via Tailwind

### Environment Variables
Key variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side service role key

### PWA Configuration
Retail portal is configured as a PWA with:
- Service worker via next-pwa
- Offline support
- App manifest for installability

### Testing Approach
Testing infrastructure has been removed per cleanup. When implementing tests:
- Use the testing MCP for E2E and integration tests
- Focus on critical user paths and business logic
- No need for backward compatibility in test implementations

### API Patterns
- All API calls go through tRPC
- Use procedures with proper input validation (Zod)
- Implement optimistic updates for better UX
- Handle errors gracefully with user-friendly messages

### Performance Considerations
- Use React Query for caching and background refetching
- Implement code splitting and lazy loading
- Optimize images with Next.js Image component
- Use server components to reduce client bundle size

### Security Practices
- Row-level security (RLS) in Supabase
- Input validation with Zod schemas
- Secure session management via Supabase Auth
- Environment variables for sensitive configuration