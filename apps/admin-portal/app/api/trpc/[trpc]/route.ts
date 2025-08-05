import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@livrili/api/src/root'
import { createAppContext } from '@livrili/api/src/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createAppContext(opts),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}:`,
              error.message,
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }