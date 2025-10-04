import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useEffect } from 'react'

function RootComponent() {
  // Update document title from config
  useEffect(() => {
    document.title = appConfig.name
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster richColors position="bottom-right" closeButton />
          <TanStackRouterDevtools />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-3">
          <h1 className="text-9xl font-bold tracking-tight">404</h1>
          <p className="text-2xl font-semibold">Page not found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})
