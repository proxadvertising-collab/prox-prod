import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ReferralLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cookieStore = await cookies()
  cookieStore.set('prox_ref', code, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  redirect('/signup')
}
