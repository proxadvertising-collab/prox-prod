'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LocationButton from '@/components/LocationButton'

export default function PostDealPage() {
  const [postType, setPostType] = useState<'deal' | 'open'>('deal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successDealId, setSuccessDealId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      setError('Please provide location.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()

    if (!business) {
      const { data: newBiz, error: bizErr } = await supabase.from('businesses').insert({
        owner_id: user.id,
        name: user.email?.split('@')[0] + "'s Business",
        lat, lng,
      }).select('id').single()
      if (bizErr || !newBiz) { setLoading(false); setError('Failed to create business.'); return }
      business = newBiz
    }

    let imageUrl = null
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36)}-${Date.now()}.${fileExt}`
      const { error: uploadErr } = await supabase.storage.from('deal-images').upload(fileName, imageFile)
      if (!uploadErr) {
        imageUrl = supabase.storage.from('deal-images').getPublicUrl(fileName).data.publicUrl
      }
    }

    const { data: insertedDeal, error: dealErr } = await supabase.from('deals').insert({
      business_id: business.id,
      owner_id: user.id,
      title, description,
      price_display: postType === 'deal' ? priceDisplay : null,
      original_price: postType === 'deal' ? originalPrice || null : null,
      post_type: postType,
      image_url: imageUrl,
      lat, lng,
      expires_at: null,
      is_active: true,
    }).select('id').single()

    setLoading(false)
    if (dealErr) {
      setError(dealErr.message)
    } else if (insertedDeal) {
      setSuccessDealId(insertedDeal.id)
    }
  }

  const shareLink = successDealId ? `https://prox.to/d/${successDealId}` : ''
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (successDealId) {
    return (
      <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-12 pb-32 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-black">✓</div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Post live!</h1>
          <p className="text-sm text-gray-600">Share to drive traffic and attract nearby customers instantly.</p>
        </div>
        <div className="w-full space-y-2">
          <input type="text" readOnly value={shareLink} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 text-center" />
          <button onClick={handleCopy} className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
            {copied ? 'Copied!' : 'Copy Share Link 🔗'}
          </button>
        </div>
        <a href="/" className="text-sm font-semibold text-gray-500 hover:text-black underline">Back to Feed</a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-8 pb-32 shadow-2xl flex flex-col">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Post Live Update</h1>
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
        <button type="button" onClick={() => setPostType('deal')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${postType === 'deal' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>🏷️ Deal / Offer</button>
        <button type="button" onClick={() => setPostType('open')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${postType === 'open' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>🟢 We're Open</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black" placeholder="Offer Title" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
          <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black" placeholder="Details..." />
        </div>
        {postType === 'deal' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price</label>
              <input type="text" required value={priceDisplay} onChange={(e) => setPriceDisplay(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" placeholder="99 THB" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Original Price (Opt)</label>
              <input type="text" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="199 THB" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Photo (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
          <LocationButton onLocation={handleLocation} />
          {lat !== null && lng !== null && (
            <div className="mt-3">
              <iframe src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`} className="w-full h-40 rounded-xl border border-gray-200" loading="lazy" />
              <p className="text-xs text-gray-500 mt-1">📍 Accuracy: {accuracy} meters</p>
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors mt-6">{loading ? 'Posting...' : 'Post Live'}</button>
      </form>
    </main>
  )
}
