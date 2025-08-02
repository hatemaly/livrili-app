# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Livrili is a B2B marketplace platform connecting retailers and suppliers in Algeria. The project consists of two main applications:
1. **Admin Portal** - Internal operations management system
2. **Users Portal** - Customer-facing application for retailers

## Architecture & Technology Stack

### Recommended Stack (To be implemented)
- **Frontend**: React/Next.js with TypeScript for both portals
- **Backend**: Node.js with Express/NestJS or Python with FastAPI
- **Database**: PostgreSQL for relational data, Redis for caching
- **Mobile**: Progressive Web App (PWA) initially, native apps in Phase 2
- **Languages**: Multi-language support (Arabic RTL, French, English)

### Key Architectural Considerations
- **Mobile-First Design**: Primary users access via mobile devices
- **Offline Capabilities**: Critical for unreliable network conditions
- **Multi-User Accounts**: Single retailer account with multiple users sharing credentials
- **Cash-Based Economy**: Cash on delivery is primary payment method
- **Performance**: Optimize for 3G/4G networks, <3s load times

## Development Commands

Since the project is in initial setup phase, here are recommended commands to establish:

### Initial Setup
```bash
# Frontend setup (recommended)
npx create-next-app@latest admin-portal --typescript --tailwind --app
npx create-next-app@latest user-portal --typescript --tailwind --app

# Backend setup (Node.js option)
npm init -y
npm install express typescript @types/node @types/express
npm install -D nodemon ts-node

# Backend setup (Python option)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy alembic
```

### Future Development Commands
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter

# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run test suite
```

## Core Business Logic

### User Types & Permissions
1. **Admin Users**: Full system access, order management, user approval
2. **Retailers**: Browse products, place orders, manage credit/debit
3. **Drivers**: Delivery management, cash collection (future)

### Critical Workflows
1. **Retailer Onboarding**: Registration → Document Upload → Admin Approval → Account Activation
2. **Order Flow**: Browse → Add to Cart → Checkout → Admin Processing → Delivery → Cash Collection
3. **Credit Management**: Credit Limit Assignment → Usage Tracking → Payment Collection → Overdue Management

### Key Features to Implement
- **Authentication**: Username/password with admin-managed passwords
- **Product Catalog**: FMCG categories with multi-language support
- **Order Management**: Manual order creation, modification, tracking
- **Delivery Tracking**: Driver assignment, route optimization
- **Financial Management**: Cash tracking, credit limits, invoicing

## Data Models (Conceptual)

### Core Entities
- **Users**: id, username, password, role, retailer_id, created_at
- **Retailers**: id, business_name, documents, credit_limit, balance, status
- **Products**: id, name_ar, name_fr, name_en, price, stock, category_id
- **Orders**: id, retailer_id, items, total, status, delivery_date
- **Payments**: id, order_id, amount, type (cash/credit), collected_at

## Important Business Rules

1. **Single Supplier Model**: Platform operates with one supplier initially
2. **Shared Accounts**: Multiple users can access one retailer account
3. **Activity Tracking**: Log all actions with user identification
4. **Credit System**: Retailers have credit limits and can go into debit
5. **Cash Primary**: Cash on delivery is the main payment method
6. **Multi-Language**: All content must support Arabic, French, and English

## UI/UX Guidelines

Follow the brand identity:
- **Primary Color**: Prussian Blue (#003049)
- **Secondary Color**: Fire Brick (#C1121F)
- **Accent Colors**: Air Blue (#669BBC), Papaya Whip (#FDF0D5)
- **Typography**: System fonts with Arabic support
- **Logo**: Box icon with checkmark + "Livrili" text

## Performance Requirements

- **Load Time**: <3s on 3G, <1s on WiFi
- **Bundle Size**: <500KB initial, <2MB total
- **Offline Mode**: Cache critical data for offline access
- **API Response**: <200ms for critical operations

## Security Considerations

- **Authentication**: Implement secure password hashing
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypt sensitive data
- **Session Management**: Secure session handling
- **Input Validation**: Validate all user inputs
- **API Security**: Implement rate limiting and CORS

## Development Priorities

1. **Phase 1**: Basic admin portal with user management and product catalog
2. **Phase 2**: Retailer portal with ordering functionality
3. **Phase 3**: Credit system and financial management
4. **Phase 4**: Delivery tracking and driver management
5. **Phase 5**: Analytics and reporting dashboards