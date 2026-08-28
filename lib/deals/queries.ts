import { createBrowserClient } from '@/lib/supabase/client'
import { Deal } from './types'

export async function getLiveDeals(): Promise<Deal[]> {
  const supabase = createBrowserClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching live deals:', error.message)
    return []
  }

  return data as Deal[]
}
