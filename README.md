# Frummy

A DUMB frontend template for building Supabase + n8n applications with **ZERO business logic** in the frontend.

## What is this?

Frummy is an opinionated React template that enforces a clean separation of concerns:

- **Frontend (this repo)**: Auth + CRUD + Realtime subscriptions ONLY
- **Supabase**: Database, Auth, Row Level Security, Realtime, Database Triggers
- **n8n**: ALL business logic, workflows, integrations

## Quick Start

### 1. Clone this template

```bash
git clone <your-repo-url> my-project
cd my-project
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Add your Supabase credentials to `.env.local`:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173` - you should see the landing page!

### 4. (Optional) Disable email confirmation

For development, you might want to disable email confirmation:

1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Email" provider
3. Disable "Confirm email"

This lets you sign up and test immediately without setting up email.

## Tech Stack

- **[Vite](https://vitejs.dev)** (using rolldown-vite for faster builds)
- **[React 19](https://react.dev)** with TypeScript
- **[TanStack Router](https://tanstack.com/router)** - Type-safe file-based routing
- **[Tailwind CSS v4](https://tailwindcss.com)** - Styling
- **[shadcn/ui](https://ui.shadcn.com)** - Component library (Radix UI + Tailwind)
- **[Supabase](https://supabase.com)** - Backend (database, auth, realtime)

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── nav.tsx                # Main navigation
│   ├── footer.tsx             # Footer
│   ├── theme-toggle.tsx       # Dark/light mode toggle
│   └── dashboard-layout.tsx   # Reusable layout for protected pages
├── lib/
│   ├── auth-context.tsx       # Auth state management
│   ├── theme-provider.tsx     # Theme state management
│   ├── supabase/
│   │   └── client.ts          # Supabase client setup
│   └── utils.ts               # Utilities (cn, etc.)
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # Landing page (/)
│   ├── dashboard.tsx          # Dashboard (/dashboard)
│   └── auth/
│       ├── login.tsx          # Login page
│       └── signup.tsx         # Signup page
├── App.tsx                    # Router setup
├── main.tsx                   # Entry point
└── index.css                  # Global styles + theme
```

## Key Concepts

### 🚫 ZERO Business Logic in Frontend

This template enforces a strict rule: **NO BUSINESS LOGIC IN THE FRONTEND**.

**✅ What you CAN do:**
- Auth (login, signup, logout)
- CRUD operations (create, read, update, delete)
- Realtime subscriptions
- Display data
- Form validation (format only, e.g., email format)

**❌ What you CANNOT do:**
- Business calculations
- Status transitions based on business rules
- Workflow automation
- Complex data transformations
- Background processing

**Where business logic belongs:**
All business logic should be implemented in **n8n workflows**, triggered by Supabase database triggers.

### The Flow

```
User Action (UI)
    ↓
Frontend: Simple CRUD operation
    ↓
Supabase: Database trigger fires
    ↓
n8n: Receives webhook, executes business logic
    ↓
n8n: Updates database with results
    ↓
Supabase: Broadcasts change via Realtime
    ↓
Frontend: Updates UI (via realtime subscription)
```

## Common Tasks

### Add a new page

1. Create a new file in `src/routes/`, e.g., `src/routes/settings.tsx`
2. Use the `createFileRoute` helper:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/dashboard-layout'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  return (
    <DashboardLayout title="Settings" description="Manage your account">
      {/* Your content */}
    </DashboardLayout>
  )
}
```

3. TanStack Router will automatically pick it up!

### Add a protected route

Use the auth check pattern:

```tsx
function MyProtectedPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    window.location.href = '/auth/login'
    return null
  }

  return <div>Protected content</div>
}
```

### Add a new UI component

Use shadcn/ui CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
# etc.
```

Or browse available components at [ui.shadcn.com](https://ui.shadcn.com)

### Subscribe to realtime changes

```tsx
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function MyComponent() {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('my-channel')
      .on('broadcast', { event: 'my_event' }, (payload) => {
        console.log('Received:', payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>...</div>
}
```

## Database Guidelines

See [CLAUDE.md](./CLAUDE.md) for comprehensive database, RLS, and Supabase Realtime guidelines.

**Quick tips:**
- Always enable RLS on new tables
- Use lowercase SQL, snake_case naming
- One RLS policy per operation per role
- Index columns used in RLS policies
- Use `broadcast` for realtime (NOT `postgres_changes`)

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## Environment Variables

Required in `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

This is a static SPA. Deploy to:
- **Vercel**: Connect repo, auto-deploy
- **Netlify**: Connect repo, auto-deploy
- **Cloudflare Pages**: Connect repo, auto-deploy

Make sure to add environment variables in your deployment platform.

## Features

✅ Authentication (Supabase Auth)
✅ Protected routes
✅ Dark/light mode
✅ Responsive design
✅ Type-safe routing (TanStack Router)
✅ Clean component architecture
✅ Realtime subscriptions ready

## Need Help?

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **TanStack Router**: [tanstack.com/router](https://tanstack.com/router)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

---

**Remember:** This is a DUMB frontend. Keep it simple. Keep business logic in n8n. 🧠
