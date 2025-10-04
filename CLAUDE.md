# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ CRITICAL: This is a DUMB Application

This application is **intentionally designed with ZERO BUSINESS LOGIC** in the frontend code. All business logic is handled externally through n8n workflows.

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────┐
│ Supabase                                            │
│ - PostgreSQL Database (storage)                     │
│ - Realtime (subscriptions)                          │
│ - Row Level Security (authorization)                │
│ - Database Triggers (→ webhooks to n8n)            │
└─────────────────────────────────────────────────────┘
                    ↑         ↓
                    │         │
        ┌───────────┘         └─────────────┐
        │                                   │
┌───────────────────┐              ┌───────────────────┐
│ Vite/React TS SPA │              │ n8n               │
│ (this repo)       │              │ - Workflows       │
│                   │              │ - Business Logic  │
│ - Auth ONLY       │              │ - Processing      │
│ - CRUD ONLY       │              │ - Integrations    │
│ - Realtime ONLY   │              │                   │
│ - NO LOGIC!       │              └───────────────────┘
└───────────────────┘
```

### Frontend Allowed Operations (✅)

**ONLY these operations are permitted:**

1. **Authentication**
   - Login/logout
   - Session management
   - Auth state tracking

2. **CRUD Operations**
   - Create records (INSERT)
   - Read records (SELECT)
   - Update records (UPDATE)
   - Delete records (DELETE)

3. **Realtime Subscriptions**
   - Subscribe to database changes via `broadcast`
   - Listen to broadcast events
   - Update UI based on realtime data

4. **UI/UX Only**
   - Form validation (format only, not business rules)
   - Loading states
   - Error displays
   - Navigation
   - Visual feedback

### Frontend Forbidden Operations (❌)

**NEVER implement any of the following in the frontend:**

1. **Business Logic**
   - Calculations beyond simple UI display
   - Status transitions based on business rules
   - Workflow automation
   - Data transformations
   - Conditional processing
   - Aggregations beyond simple counts for display

2. **Complex Validations**
   - Cross-record validation
   - Business rule enforcement
   - Complex permission checks beyond RLS

3. **Background Processing**
   - Scheduled tasks
   - Batch operations
   - Data synchronization
   - External API calls for business purposes

### When Business Logic is Requested

If a user asks you to implement business logic in the frontend, you MUST:

1. **Stop and explain** that business logic belongs in n8n workflows
2. **Suggest the correct approach:**
   - Create the CRUD operation in the frontend
   - Set up a database trigger in Supabase
   - Implement the business logic in n8n
   - Use realtime to reflect changes in the UI

3. **Example Response:**

```
I cannot implement that business logic in the frontend. This application
is designed as a DUMB app with zero business logic.

Here's the correct approach:

1. Frontend (React): Create a simple INSERT/UPDATE form for the data
2. Supabase: Add a database trigger on INSERT/UPDATE
3. n8n: Create a workflow that receives the webhook and implements:
   - [list the business logic here]
4. Frontend (React): Subscribe to realtime changes to update the UI

Would you like me to:
- Create the CRUD interface in React?
- Write the database trigger SQL?
- Outline the n8n workflow requirements?
```

### Example Flow

```
User creates record in UI
    ↓
Frontend: INSERT into Supabase (CRUD only)
    ↓
Supabase: Trigger fires
    ↓
Webhook → n8n Workflow
    ↓
n8n: Execute business logic
    ↓
n8n: UPDATE Supabase (results)
    ↓
Supabase Realtime: Broadcast change
    ↓
Frontend: Update UI (realtime subscription)
```

### Acceptable vs Unacceptable Frontend Code

```typescript
// ✅ GOOD: Simple CRUD
const handleSubmit = async (data) => {
  await supabase.from('tasks').insert(data)
}

// ✅ GOOD: Realtime subscription
useEffect(() => {
  const channel = supabase
    .channel('tasks:123', { config: { private: true } })
    .on('broadcast', { event: 'task_updated' }, handleChange)
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])

// ❌ BAD: Business logic - DON'T DO THIS!
const handleSubmit = async (data) => {
  if (data.status === 'pending' && data.priority === 'high') {
    data.assignedTo = await findBestAssignee()
    data.dueDate = calculateDueDate(data.priority)
  }
  await supabase.from('tasks').insert(data)
}
```

---

## Development Commands

```bash
# Development server with HMR
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## Technology Stack

- **Build Tool:** Vite (using rolldown-vite@7.1.14 variant)
- **Framework:** React 19 with TypeScript
- **Routing:** TanStack Router (file-based routing)
- **Styling:** Tailwind CSS v4 with shadcn/ui components (Radix UI primitives)
- **Backend:** Supabase (database, auth, realtime)
- **Notifications:** Sonner (toast notifications)
- **State:** No global state library - use Supabase realtime subscriptions

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (Button, Card, Skeleton, etc.)
│   ├── nav.tsx                # Main navigation with auth state
│   ├── footer.tsx             # Footer component
│   ├── theme-toggle.tsx       # Dark/light mode toggle
│   ├── loading.tsx            # Loading states (spinner, full-screen)
│   ├── error-boundary.tsx     # React error boundary
│   └── dashboard-layout.tsx   # Reusable layout for protected pages
├── config/
│   └── app.ts                 # App configuration (name, nav links, footer)
├── lib/
│   ├── auth-context.tsx       # Auth state management (useAuth hook)
│   ├── theme-provider.tsx     # Theme state management (dark/light)
│   ├── supabase/
│   │   └── client.ts          # Supabase client setup
│   └── utils.ts               # Utilities (cn for className merging)
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx             # Root layout (providers, 404 handler)
│   ├── index.tsx              # Landing page (/)
│   ├── dashboard.tsx          # Dashboard (/dashboard) - protected
│   └── auth/
│       ├── login.tsx          # Login page with toast notifications
│       └── signup.tsx         # Signup page
├── App.tsx                    # Router setup
├── main.tsx                   # Entry point
└── index.css                  # Global styles + theme variables
```

---

## App Configuration

All app-specific settings are centralized in `src/config/app.ts` for easy customization:

```typescript
export const appConfig = {
  // App Identity
  name: 'Frummy',
  description: 'A DUMB frontend for Supabase + n8n',

  // Author Info
  author: {
    name: 'Stu Mason',
    email: 'stu@stuartmason.co.uk',
  },

  // Footer
  footer: {
    text: 'A DUMB frontend template',
    showTechStack: true, // Set to false to hide "Built with..." links
  },
}
```

**When cloning for a new project:**
1. Update `src/config/app.ts` with your app name and footer text
2. Update `src/components/nav.tsx` to add/remove navigation links
3. Update `index.html` with page title and meta description
4. Update `package.json` with your project metadata
5. Update `README.md` with your project details

**What `appConfig` controls:**
- `name` - Browser tab title (via useEffect in __root.tsx) and navigation logo
- `footer.text` - Footer text content
- `footer.showTechStack` - Show/hide "Built with..." tech stack links

---

## Supabase Integration

### Client Setup

Supabase clients are configured in `src/lib/supabase/client.ts`:
- Browser client using `@supabase/ssr`
- Uses Vite environment variables (VITE_* prefix)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )
}
```

### Environment Setup

Required in `.env.local`:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Vite uses `VITE_*` prefix, NOT `NEXT_PUBLIC_*`

---

## TanStack Router

This project uses TanStack Router for file-based routing with full type safety.

### File-Based Routing

Routes are defined in the `src/routes/` directory:

```
src/routes/
├── __root.tsx           # Root layout (wraps all routes)
├── index.tsx            # / (landing page)
├── dashboard.tsx        # /dashboard
└── auth/
    ├── login.tsx        # /auth/login
    └── signup.tsx       # /auth/signup
```

### Creating a New Route

Create a file in `src/routes/`:

```typescript
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

### Root Layout

The root layout (`src/routes/__root.tsx`) wraps all routes and includes:
- Providers (ThemeProvider, AuthProvider)
- Toast notifications (Toaster)
- 404 handler (notFoundComponent)

```typescript
export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="bottom-right" closeButton />
        <TanStackRouterDevtools />
      </AuthProvider>
    </ThemeProvider>
  ),
  notFoundComponent: NotFound,
})
```

### Navigation

Use TanStack Router's `Link` component for type-safe navigation:

```typescript
import { Link } from '@tanstack/react-router'

<Link to="/dashboard">
  <Button>Go to Dashboard</Button>
</Link>
```

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()
navigate({ to: '/dashboard' })
```

---

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which has different syntax from v3.

### Theme Configuration

Theme variables are defined in `src/index.css` using the `@theme` directive:

```css
@import 'tailwindcss';

@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 10%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(0 0% 10%);
  --color-primary: hsl(222 47% 11%);
  --color-primary-foreground: hsl(210 40% 98%);
  /* ... more color variables */
}

.dark {
  color-scheme: dark;
  --color-background: hsl(0 0% 10%);
  --color-foreground: hsl(0 0% 98%);
  /* ... dark mode color overrides */
}
```

### Key Differences from v3

1. **Use `@theme` instead of `@layer base`**
2. **Color variables must use `--color-*` prefix**
3. **Use `hsl()` values (NOT `oklch()` or raw values)**
4. **Dark mode uses class-based `.dark` overrides**
5. **Import Tailwind with `@import 'tailwindcss'`**

### Adding Custom Colors

```css
@theme {
  --color-custom: hsl(200 80% 50%);
  --color-custom-foreground: hsl(0 0% 100%);
}
```

Then use in components:
```tsx
<div className="bg-custom text-custom-foreground">
  Custom colored element
</div>
```

---

## Database Guidelines

### Migration Files

- Location: `supabase/migrations/`
- Naming: `YYYYMMDDHHmmss_short_description.sql` (UTC timestamp)
- Example: `20240906123045_create_profiles.sql`

### Migration Best Practices

- Include header comments with metadata (purpose, affected tables, considerations)
- Write all SQL in **lowercase**
- Add copious comments for destructive operations (DROP, TRUNCATE, ALTER)
- **Always enable RLS** on new tables, even for public access
- Include table comments (up to 1024 chars)

Example:
```sql
-- Migration: Create user profiles table
-- Purpose: Store extended user profile information
-- Affected: New table public.profiles

create table public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,
  display_name text,
  created_at timestamptz default now()
);

comment on table public.profiles is 'Extended user profile information';

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies (granular: one per operation per role)
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );
```

### SQL Style Guide

**Naming:**
- snake_case for tables and columns
- Plural table names (`users`, `profiles`)
- Singular column names (`user_id`, `status`)
- Foreign keys: `{table_singular}_id` (e.g., `user_id` references `users`)

**Structure:**
- Always add `id bigint generated always as identity primary key` unless specified otherwise
- Create in `public` schema by default
- Always qualify with schema in queries (`public.users`)

**Formatting:**
```sql
-- Small queries: keep concise
select * from users where active = true;

-- Larger queries: add newlines
select
  users.id,
  users.email,
  profiles.display_name
from
  users
  join profiles on users.id = profiles.user_id
where users.created_at > '2024-01-01';
```

**CTEs for complex queries:**
```sql
with
  active_users as (
    -- Get all active users
    select id, email from users where active = true
  ),
  recent_orders as (
    -- Get orders from last 30 days
    select user_id, count(*) as order_count
    from orders
    where created_at > now() - interval '30 days'
    group by user_id
  )
select
  active_users.email,
  recent_orders.order_count
from active_users
join recent_orders on active_users.id = recent_orders.user_id;
```

---

## Row Level Security (RLS) Policies

### RLS Best Practices

- Create **granular policies**: one per operation (SELECT, INSERT, UPDATE, DELETE), one per role (`anon`, `authenticated`)
- **DO NOT combine** policies even if functionality is the same
- Use `auth.uid()` instead of `current_user`
- **Always index columns** used in RLS policies
- Wrap functions in `(select ...)` for performance (caches result per-statement)

### Policy Syntax Rules

- **SELECT**: Use `USING` only (no `WITH CHECK`)
- **INSERT**: Use `WITH CHECK` only (no `USING`)
- **UPDATE**: Use both `USING` and `WITH CHECK`
- **DELETE**: Use `USING` only (no `WITH CHECK`)
- **Never use `FOR ALL`** - separate into 4 policies

### Correct Policy Order

```sql
-- ✅ Correct
create policy "Policy name"
on table_name
for select              -- operation first
to authenticated        -- role second
using ( condition );

-- ❌ Incorrect
create policy "Policy name"
on table_name
to authenticated        -- role before operation (WRONG!)
for select
using ( condition );
```

### Example Policies

```sql
-- SELECT policies (separate for each role)
create policy "Authenticated users can view profiles"
on profiles
for select
to authenticated
using ( true );

create policy "Anonymous users can view profiles"
on profiles
for select
to anon
using ( true );

-- INSERT policy (users can only create their own profile)
create policy "Users can create their own profile"
on profiles
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- UPDATE policy (users can only update their own profile)
create policy "Users can update their own profile"
on profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- DELETE policy
create policy "Users can delete their own profile"
on profiles
for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- Add index for performance
create index idx_profiles_user_id on profiles(user_id);
```

### Advanced RLS Patterns

**Using JWT metadata:**
```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams') );
```

**Minimize joins for performance:**
```sql
-- ❌ Slow: joins source table to target
create policy "Users can access team records"
on test_table
to authenticated
using (
  (select auth.uid()) in (
    select user_id from team_user
    where team_user.team_id = team_id  -- join!
  )
);

-- ✅ Fast: fetch criteria into set, no join
create policy "Users can access team records"
on test_table
to authenticated
using (
  team_id in (
    select team_id from team_user
    where user_id = (select auth.uid())  -- no join
  )
);
```

---

## Database Functions

### When to Use Database Functions

⚠️ **Before creating functions with business logic, consider if it belongs in n8n instead!**

Database functions should primarily be used for:
- **Triggers that call n8n webhooks**
- RLS helper functions
- Simple data access patterns
- Performance-critical operations

### Function Best Practices

1. **Default to `SECURITY INVOKER`** (run with caller's permissions)
2. **Always set `search_path = ''`** to avoid security risks
3. **Use fully qualified names** (`public.table_name`)
4. **Explicit typing** for inputs and outputs
5. **Prefer `IMMUTABLE` or `STABLE`** when possible (use `VOLATILE` only for data modifications)

### Function Examples

**Simple function:**
```sql
create or replace function public.hello_world()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return 'hello world';
end;
$$;
```

**Trigger function (for calling n8n webhooks):**
```sql
create or replace function public.notify_task_changes()
returns trigger
language plpgsql
security definer  -- needed for realtime.send or http calls
set search_path = ''
as $$
begin
  -- Call n8n webhook via http extension or realtime.send
  perform realtime.send(
    'tasks:' || new.id::text,
    'task_updated',
    jsonb_build_object('id', new.id, 'status', new.status),
    false
  );
  return new;
end;
$$;

create trigger task_changes_trigger
  after insert or update on public.tasks
  for each row
  execute function public.notify_task_changes();
```

**Immutable function (optimized):**
```sql
create or replace function public.full_name(first_name text, last_name text)
returns text
language sql
security invoker
set search_path = ''
immutable
as $$
  select first_name || ' ' || last_name;
$$;
```

---

## Supabase Realtime

### Core Principles

- **Use `broadcast`** for all realtime events (NOT `postgres_changes` - it doesn't scale)
- **Use `presence`** sparingly for user state tracking
- **Always use private channels** (`private: true`) with RLS
- **Always include cleanup** (unsubscribe on unmount)
- **Check channel state** before subscribing

### Naming Conventions

**Channels (topics):**
- Pattern: `scope:entity:id`
- Examples: `room:123:messages`, `user:456:notifications`, `tasks:789`

**Events:**
- Pattern: `entity_action` (snake_case)
- Examples: `message_created`, `user_joined`, `task_updated`
- **Avoid generic names** like `update`, `change`

### React Pattern

```typescript
const channelRef = useRef(null)

useEffect(() => {
  // Prevent duplicate subscriptions
  if (channelRef.current?.state === 'subscribed') return

  const channel = supabase.channel('room:123:messages', {
    config: { private: true }
  })
  channelRef.current = channel

  // Set auth before subscribing
  await supabase.realtime.setAuth()

  channel
    .on('broadcast', { event: 'message_created' }, handleMessage)
    .on('broadcast', { event: 'user_joined' }, handleUserJoined)
    .subscribe()

  return () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }
}, [roomId])
```

### Database Triggers for Realtime

**Generic trigger (broadcasts to `table:id`):**
```sql
create or replace function notify_table_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    TG_TABLE_NAME || ':' || coalesce(NEW.id, OLD.id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  return coalesce(NEW, OLD);
end;
$$;

create trigger tasks_broadcast_trigger
  after insert or update or delete on tasks
  for each row execute function notify_table_changes();
```

**Custom trigger (specific topic and payload):**
```sql
create or replace function notify_custom_event()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.send(
    'room:' || NEW.room_id::text,
    'status_changed',
    jsonb_build_object('id', NEW.id, 'status', NEW.status),
    false
  );
  return NEW;
end;
$$;
```

**Conditional broadcasting (only significant changes):**
```sql
if TG_OP = 'UPDATE' and OLD.status is distinct from NEW.status then
  perform realtime.broadcast_changes(...);
end if;
```

### RLS for Realtime Channels

To use private channels, create RLS policies on `realtime.messages`:

```sql
-- Read access (SELECT)
create policy "room_members_can_read"
on realtime.messages
for select
to authenticated
using (
  topic like 'room:%' and
  exists (
    select 1 from room_members
    where user_id = (select auth.uid())
    and room_id = split_part(topic, ':', 2)::uuid
  )
);

-- Write access (INSERT)
create policy "room_members_can_write"
on realtime.messages
for insert
to authenticated
with check (
  topic like 'room:%' and
  exists (
    select 1 from room_members
    where user_id = (select auth.uid())
    and room_id = split_part(topic, ':', 2)::uuid
  )
);

-- Index for performance!
create index idx_room_members_user_room on room_members(user_id, room_id);
```

### Realtime Performance Tips

1. **Use dedicated topics** (one per room/entity, not global)
2. **Shard high-volume topics**: `chat:shard:1`, `chat:shard:2`
3. **Always index RLS policy columns**
4. **Enable logging for debugging:**
```typescript
const supabase = createClient(url, key, {
  realtime: {
    params: { log_level: 'info' }
  }
})
```

---

## Edge Functions

⚠️ **Before creating Edge Functions with business logic, consider if it belongs in n8n instead!**

Edge Functions should primarily be used for:
- Receiving webhooks FROM n8n
- Calling webhooks TO n8n
- Auth-related operations
- Simple proxies to n8n

### Edge Function Best Practices

1. Use Web APIs and Deno core APIs (NOT external dependencies when possible)
2. Use `Deno.serve` (NOT `import { serve } from deno.land`)
3. Prefix dependencies with `npm:` or `jsr:` and include versions: `npm:express@4.18.2`
4. Avoid imports from `deno.land/x`, `esm.sh`, `unpkg.com`
5. Use Node APIs with `node:` prefix when needed: `import process from 'node:process'`
6. File writes only to `/tmp` directory
7. Use `EdgeRuntime.waitUntil()` for background tasks

### Pre-populated Environment Variables

These are available automatically in Supabase Edge Functions:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Set other secrets with: `supabase secrets set --env-file path/to/env-file`

### Edge Function Example

```typescript
// Simple webhook receiver from n8n
interface WebhookPayload {
  task_id: string
  result: string
}

Deno.serve(async (req: Request) => {
  const { task_id, result }: WebhookPayload = await req.json()

  // Update database with n8n workflow results
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseKey)

  await supabase
    .from('tasks')
    .update({ result })
    .eq('id', task_id)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Component Patterns

### UI Components (shadcn/ui)

- Located in `src/components/ui/`
- Uses Radix UI primitives
- Styled with Tailwind CSS v4
- Variants via `class-variance-authority`
- `cn()` utility from `src/lib/utils.ts` for className merging

Add new components with:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Layout Components

**DashboardLayout** (`src/components/dashboard-layout.tsx`)
- Reusable layout for protected pages
- Includes Nav, Footer, and main content area
- Props: `title`, `description`, `children`

```typescript
<DashboardLayout title="Dashboard" description="Welcome back">
  {/* Your content */}
</DashboardLayout>
```

**Nav** (`src/components/nav.tsx`)
- Main navigation with auth state
- Mobile menu support
- Theme toggle integration

**Footer** (`src/components/footer.tsx`)
- Footer with tech stack links
- Automatically included in DashboardLayout

### Auth Components

Auth pages use TanStack Router file-based routing:
- `src/routes/auth/login.tsx` - Login with toast notifications
- `src/routes/auth/signup.tsx` - Signup form

All use the client from `src/lib/supabase/client.ts`

### Theme System

**ThemeProvider** (`src/lib/theme-provider.tsx`)
- Dark/light mode (no system option)
- Defaults to system preference on first load
- Persists to localStorage

**ThemeToggle** (`src/components/theme-toggle.tsx`)
- Button to toggle between dark/light
- Shows sun icon in light mode, moon icon in dark mode

Usage:
```typescript
import { useTheme } from '@/lib/theme-provider'

const { theme, setTheme } = useTheme()
setTheme('dark') // or 'light'
```

### Loading States

**Loading Component** (`src/components/loading.tsx`)
- Reusable loading spinner with text
- Supports full-screen mode

Usage:
```typescript
import { Loading } from '@/components/loading'

// Inline loading
<Loading text="Loading data..." />

// Full-screen loading
<Loading text="Loading..." fullScreen />
```

**Skeleton Loaders** (`src/components/ui/skeleton.tsx`)
- Better UX for content loading states
- Shows content structure while loading

Usage:
```typescript
import { Skeleton } from '@/components/ui/skeleton'

// Single skeleton
<Skeleton className="h-12 w-full" />

// Card skeleton
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Toast Notifications

Uses Sonner for toast notifications:

```typescript
import { toast } from 'sonner'

// Success toast
toast.success('Success!', { description: 'Your changes have been saved' })

// Error toast
toast.error('Error', { description: 'Something went wrong' })

// Info toast
toast.info('Info', { description: 'Please check your email' })
```

Toaster is configured in `src/routes/__root.tsx`:
```typescript
<Toaster richColors position="bottom-right" closeButton />
```

### Error Handling

**Error Boundary** (`src/components/error-boundary.tsx`)
- Catches React errors gracefully
- Prevents white screen of death
- Provides reset and home navigation

Wraps the entire app in `src/routes/__root.tsx`:
```typescript
export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  ),
})
```

**404 Page**

404 handling is configured in `src/routes/__root.tsx` using `notFoundComponent`:

```typescript
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-9xl font-bold tracking-tight">404</h1>
        <p className="text-2xl font-semibold">Page not found</p>
        {/* Go Home and Go Back buttons */}
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})
```

### Auth Context

**AuthProvider** (`src/lib/auth-context.tsx`)
- Provides global auth state
- Tracks user, session, loading state
- Provides signOut function

Usage:
```typescript
import { useAuth } from '@/lib/auth-context'

const { user, session, loading, signOut } = useAuth()

if (loading) {
  return <Loading text="Loading..." fullScreen />
}

if (!user) {
  window.location.href = '/auth/login'
  return null
}
```

### Protected Routes Pattern

```typescript
import { Loading } from '@/components/loading'
import { useAuth } from '@/lib/auth-context'

function MyProtectedPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading text="Loading..." fullScreen />
  }

  if (!user) {
    window.location.href = '/auth/login'
    return null
  }

  return <DashboardLayout title="My Page" description="...">
    {/* Protected content */}
  </DashboardLayout>
}
```

---

## Summary

**Remember: This frontend is DUMB by design. It can ONLY:**
- Authenticate users
- Perform CRUD operations
- Subscribe to realtime updates
- Display UI

**All intelligence lives in:**
- **n8n workflows** (business logic)
- **Supabase** (data storage, triggers, RLS, realtime)

**When implementing features:**
1. Ask: "Is this business logic?" → If yes, it belongs in n8n
2. Frontend only does CRUD + auth + realtime subscriptions
3. Database triggers call n8n webhooks
4. n8n processes and updates database
5. Realtime broadcasts changes back to frontend
