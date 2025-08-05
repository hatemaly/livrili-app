import { router } from './trpc'
import { authRouter } from './routers/auth'
import { retailerAuthRouter } from './routers/retailer-auth'
import { retailerCartRouter } from './routers/retailer-cart'
import { retailerProductsRouter } from './routers/retailer-products'
import { retailerOrdersRouter } from './routers/retailer-orders'
import { retailerSignupRouter } from './routers/retailer-signup'
import { usersRouter } from './routers/users'
import { productsRouter } from './routers/products'
import { categoriesRouter } from './routers/categories'
import { retailersRouter } from './routers/retailers'
import { ordersRouter } from './routers/orders'
import { analyticsRouter } from './routers/analytics'
import { paymentsRouter } from './routers/payments'
import { deliveriesRouter } from './routers/deliveries'
import { communicationsRouter } from './routers/communications'
import { intelligenceRouter } from './routers/intelligence'
import { reportsRouter } from './routers/reports'
import { tagsRouter } from './routers/tags'
import { suppliersRouter } from './routers/suppliers'

export const appRouter = router({
  auth: authRouter,
  retailerAuth: retailerAuthRouter,
  retailerCart: retailerCartRouter,
  retailerProducts: retailerProductsRouter,
  retailerOrders: retailerOrdersRouter,
  retailerSignup: retailerSignupRouter,
  users: usersRouter,
  products: productsRouter,
  categories: categoriesRouter,
  retailers: retailersRouter,
  orders: ordersRouter,
  analytics: analyticsRouter,
  payments: paymentsRouter,
  deliveries: deliveriesRouter,
  communications: communicationsRouter,
  intelligence: intelligenceRouter,
  reports: reportsRouter,
  tags: tagsRouter,
  suppliers: suppliersRouter,
})

export type AppRouter = typeof appRouter