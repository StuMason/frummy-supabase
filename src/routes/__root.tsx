import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-provider'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </AuthProvider>
    </ThemeProvider>
  ),
})
