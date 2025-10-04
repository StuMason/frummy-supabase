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
- **Styling:** Tailwind CSS v4 with Radix UI components
- **Backend:** Supabase (database, auth, realtime)
- **State:** No global state library - use Supabase realtime subscriptions

---

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Radix UI components (shadcn/ui pattern)
│   ├── login-form.tsx   # Auth components
│   ├── sign-up-form.tsx
│   ├── forgot-password-form.tsx
│   ├── update-password-form.tsx
│   └── logout-button.tsx
├── lib/
│   ├── supabase/        # Supabase client setup
│   │   ├── client.ts    # Browser client (createBrowserClient)
│   │   ├── server.ts    # Server-side client
│   │   └── middleware.ts
│   └── utils.ts         # Utility functions (cn, etc.)
├── middleware.ts        # Route middleware
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

---

## Supabase Integration

### Client Setup

Supabase clients are configured in `src/lib/supabase/`:
- `client.ts` - Browser client using `@supabase/ssr`
- Uses environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

### Environment Setup

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
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
- Styled with Tailwind CSS
- Variants via `class-variance-authority`
- `cn()` utility from `src/lib/utils.ts` for className merging

### Auth Components

Pre-built forms using Supabase Auth:
- `login-form.tsx`
- `sign-up-form.tsx`
- `forgot-password-form.tsx`
- `update-password-form.tsx`
- `logout-button.tsx`

All use the client from `src/lib/supabase/client.ts`

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
