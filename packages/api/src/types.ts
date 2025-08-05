import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from './root'

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>