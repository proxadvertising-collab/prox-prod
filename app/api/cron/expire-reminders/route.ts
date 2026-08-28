import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const now = new Date()
  const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const threeHoursFiveMinLater = new Date(now.getTime() + (3 * 60 * 60 + 5 * 60) * 1000)

  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .gte('expires_at', threeHoursLater.toISOString())
    .lte('expires_at', threeHoursFiveMinLater.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []
  for (const deal of deals || []) {
    if (!deal.owner_id) continue

    const { data: userData } = await supabase.auth.admin.getUserById(deal.owner_id)
    const email = userData?.user?.email
    if (!email) continue

    await resend.emails.send({
      from: 'Prox <deals@prox.app>',
      to: email,
      subject: `Your deal '${deal.title}' expires in 3 hours`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Your deal is expiring soon!</h2>
          <p>Your deal <strong>"${deal.title}"</strong> expires in 3 hours.</p>
          <p>Repost now to stay visible to customers nearby.</p>
          <a href="https://prox.app/post" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:10px;">Repost Deal</a>
        </div>
      `,
    })

    results.push(deal.id)
  }

  return NextResponse.json({ success: true, processed: results })
}
