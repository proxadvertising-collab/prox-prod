import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for trusted server contexts only
 * (cron routes, webhooks, admin scripts). Bypasses RLS and can call
 * auth.admin.* APIs. NEVER import this in client components or
 * browser code — the service role key must stay server-side.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). ' +
        'Cron routes and webhooks require the service role key, not the anon key.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
