import { type AppRouter } from '@livrili/api'
import { createTRPCReact } from '@trpc/react-query'

export const api = createTRPCReact<AppRouter>()