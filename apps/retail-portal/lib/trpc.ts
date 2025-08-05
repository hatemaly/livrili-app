import { createTRPCReact, type CreateTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@livrili/api'

export const api: CreateTRPCReact<AppRouter, unknown, null> = createTRPCReact<AppRouter>()