import { createFileRoute } from '@tanstack/react-router'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight">
              Welcome to Frummy
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A simple, clean template for building DUMB frontends with Supabase and n8n workflows.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth/signup">
              <Button size="lg" className="min-w-[200px]">Get Started</Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
