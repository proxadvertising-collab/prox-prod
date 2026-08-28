'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ReferralCard from '@/components/ReferralCard'
import BottomNav from '@/components/BottomNav'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeDeal, setActiveDeal] = useState<any>(null)
  const [pastDeals, setPastDeals] = useState<any[]>([])
  const [referredCount, setReferredCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [yelp, setYelp] = useState('')
  const [gmaps, setGmaps] = useState('')
  const [website, setWebsite] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (!prof) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email, referral_code: randomCode, credits: 0 })
          .select('*')
          .single()
        prof = newProf
      }
      setProfile(prof)
      if (prof) {
        setInstagram(prof.instagram_url || '')
        setFacebook(prof.facebook_url || '')
        setTiktok(prof.tiktok_url || '')
        setYelp(prof.yelp_url || '')
        setGmaps(prof.google_maps_url || '')
        setWebsite(prof.website_url || '')
      }

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id)
      setReferredCount(count || 0)

      const { data: deals } = await supabase.from('deals').select('*').eq('owner_id', user.id)

      if (deals) {
        const active = deals.find((d) => d.is_active)
        const past = deals.filter((d) => !d.is_active)
        setActiveDeal(active || null)
        setPastDeals(past)
      }
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('Saving...')
    const { error } = await supabase
      .from('profiles')
      .update({
        instagram_url: instagram,
        facebook_url: facebook,
        tiktok_url: tiktok,
        yelp_url: yelp,
        google_maps_url: gmaps,
        website_url: website,
      })
      .eq('id', user.id)

    if (error) setSaveStatus('Error saving: ' + error.message)
    else {
      setSaveStatus('Social links saved!')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleReactivate = async (dealId: string) => {
    if (activeDeal) {
      await supabase.from('deals').update({ is_active: false }).eq('id', activeDeal.id)
    }
    const { error } = await supabase.from('deals').update({ is_active: true, expires_at: null }).eq('id', dealId)
    if (!error) window.location.reload()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Loading account...</div>
  }

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-6 pb-28 shadow-2xl relative flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Account</h1>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-3 py-2 rounded-xl transition-colors">
          Logout
        </button>
      </div>

      {profile && (
        <ReferralCard
          referralCode={profile.referral_code || 'PROX12'}
          credits={profile.credits || 0}
          referredCount={referredCount}
        />
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-black text-gray-900">Active Live Update</h2>
        {activeDeal ? (
          <div className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 text-sm">{activeDeal.title}</h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Active & Live</span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{activeDeal.description}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">You currently have no active live updates.</p>
        )}
      </div>

      <form onSubmit={handleSaveSocials} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-black text-gray-900">Business Socials</h2>
        {saveStatus && <p className="text-xs text-blue-600 font-medium">{saveStatus}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Instagram URL</label>
            <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://instagram.com/yourbiz" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Facebook URL</label>
            <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://facebook.com/yourbiz" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">TikTok URL</label>
            <input type="url" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://tiktok.com/@yourbiz" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Yelp URL</label>
            <input type="url" value={yelp} onChange={(e) => setYelp(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://yelp.com/biz/yourbiz" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Google Maps URL</label>
            <input type="url" value={gmaps} onChange={(e) => setGmaps(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://goo.gl/maps/yourbiz" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Website URL</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="https://yourbiz.com" />
          </div>
        </div>
        <button type="submit" className="w-full h-10 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors">Save Social Links</button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-black text-gray-900">Past Updates</h2>
        {pastDeals.length === 0 ? (
          <p className="text-xs text-gray-400">No past deals.</p>
        ) : (
          <div className="space-y-3">
            {pastDeals.map((deal) => (
              <div key={deal.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                <div className="pr-4">
                  <h4 className="font-bold text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{deal.description}</p>
                </div>
                <button type="button" onClick={() => handleReactivate(deal.id)} className="bg-black text-white hover:bg-gray-800 font-bold text-[10px] px-3 py-1.5 rounded-lg shrink-0">
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
