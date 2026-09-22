import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { resend } from '@/lib/email/resend'
import { expiringSoonEmail } from '@/lib/email/templates'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cron context has no user session: use the service-role client.
  // The anon-key client cannot call auth.admin.* and is RLS-limited.
  const supabase = createServiceClient()
  const now = new Date()
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
  const nowIso = now.toISOString()

  // v1 live deals use expires_at null (until replaced) — skip them; no expiry emails.
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*, businesses(owner_id)')
    .not('expires_at', 'is', null)
    .lt('expires_at', twoHoursLater)
    .gt('expires_at', nowIso)
    .eq('email_sent', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []
  for (const deal of deals || []) {
    const ownerId = deal.businesses?.owner_id
    if (!ownerId) continue

    const { data: userData } = await supabase.auth.admin.getUserById(ownerId)
    const businessEmail = userData?.user?.email
    if (!businessEmail) continue

    const emailPayload = expiringSoonEmail(deal, businessEmail)
    await resend.emails.send({
      from: 'Prox <deals@prox.app>',
      to: emailPayload.to,
      subject: emailPayload.subject,
      html: emailPayload.html,
    })

    await supabase
      .from('deals')
      .update({ email_sent: true })
      .eq('id', deal.id)

    results.push(deal.id)
  }

  return NextResponse.json({ success: true, processed: results })
}
