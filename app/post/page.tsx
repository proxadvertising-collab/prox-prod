'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LocationButton from '@/components/LocationButton'

export default function PostDealPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [currency] = useState('THB')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLocation = (latitude: number, longitude: number, acc: number) => {
    setLat(latitude)
    setLng(longitude)
    setAccuracy(acc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lat === null || lng === null) {
      setError('Please provide your current location.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    let { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      const { data: newBiz, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: user.email?.split('@')[0] + "'s Business",
          lat,
          lng,
          currency,
        })
        .select('id')
        .single()

      if (bizErr || !newBiz) {
        setLoading(false)
        setError('Failed to create business profile.')
        return
      }
      business = newBiz
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: dealErr } = await supabase.from('deals').insert({
      business_id: business.id,
      owner_id: user.id,
      title,
      description,
      price_display: priceDisplay,
      original_price: originalPrice || null,
      lat,
      lng,
      expires_at: expiresAt,
      is_active: true,
    })

    setLoading(false)
    if (dealErr) {
      setError(dealErr.message)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-8 pb-32 shadow-2xl flex flex-col">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Post Live Deal</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deal Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g. 50% Off Craft Coffee"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Describe your offer..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deal Price</label>
            <input
              type="text"
              required
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. 99 THB"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Original Price (Opt)</label>
            <input
              type="text"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. 199 THB"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
          <LocationButton onLocation={handleLocation} />
          {lat !== null && lng !== null && (
            <div className="mt-3">
              <iframe
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                className="w-full h-40 rounded-xl border border-gray-200"
                loading="lazy"
              />
              <p className="text-xs text-gray-500 mt-1">📍 Accuracy: {accuracy} meters</p>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors mt-6"
        >
          {loading ? 'Posting...' : 'Post Deal Live for 24h'}
        </button>
      </form>
    </main>
  )
}
