import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/auth/signup')({
  component: SignUp,
})

function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email to confirm your account!')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="underline hover:text-foreground">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
