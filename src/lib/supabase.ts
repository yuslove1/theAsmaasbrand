import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Next.js 14 caches server-side fetch() calls in its Data Cache — including the ones
// supabase-js makes — and that cache survives redeploys on Vercel. Without this, each
// distinct query froze at its first result (new products never appeared on /shop or the
// homepage). Always read fresh data from the database.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noStoreFetch },
})

// Server-side client with service role (for admin operations)
export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: { fetch: noStoreFetch },
    auth: { persistSession: false },
  })
