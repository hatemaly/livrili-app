import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@livrili/api/src/root'

export const api = createTRPCReact<AppRouter>()
export const trpc = api