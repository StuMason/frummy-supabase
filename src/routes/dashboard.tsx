import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    window.location.href = '/auth/login'
    return null
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's an overview of your account."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardDescription>Account</CardDescription>
            <CardTitle className="text-2xl">{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Signed in as authenticated user
            </p>
          </CardContent>
        </Card>

        {/* Example Stat */}
        <Card>
          <CardHeader>
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No items yet. This is just a placeholder.
            </p>
          </CardContent>
        </Card>

        {/* Another Stat */}
        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account is in good standing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              This is a DUMB frontend template - all business logic happens in n8n
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What you can do here:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Perform CRUD operations via Supabase</li>
                <li>Subscribe to realtime database changes</li>
                <li>Display data from your database</li>
                <li>Trigger n8n workflows via database triggers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What you CANNOT do here:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Implement business logic (that's for n8n)</li>
                <li>Complex calculations or workflows</li>
                <li>Data transformations beyond display formatting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
