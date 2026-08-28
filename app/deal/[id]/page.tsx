import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import GoToDealButton from '@/components/feed/GoToDealButton'
import { Deal } from '@/lib/deals/types'

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !deal) {
    return (
      <main className="min-h-screen bg-white max-w-md mx-auto p-6 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800">Deal not found</h1>
        <a href="/" className="mt-4 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">Back to Feed</a>
      </main>
    )
  }

  const typedDeal = deal as Deal

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-4 py-6 pb-24 shadow-2xl flex flex-col">
      <div className="mb-4">
        <a href="/" className="text-sm font-semibold text-gray-500 hover:text-black">← Back to Feed</a>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-grow flex flex-col justify-between space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{typedDeal.title}</h1>
          <p className="text-gray-600 text-base mb-4">{typedDeal.description}</p>

          {typedDeal.price_display && (
            <div className="mb-6 inline-block bg-gray-100 text-gray-900 text-3xl font-black px-4 py-2 rounded-xl">
              {typedDeal.price_display} {typedDeal.currency_code}
            </div>
          )}

          <div className="mb-6">
            <iframe
              src={`https://maps.google.com/maps?q=${typedDeal.lat},${typedDeal.lng}&z=16&output=embed`}
              className="w-full h-64 rounded-xl border border-gray-200"
              loading="lazy"
            />
          </div>
        </div>

        <div className="space-y-4">
          <GoToDealButton lat={typedDeal.lat} lng={typedDeal.lng} distanceMeters={null} />
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Expires: {new Date(typedDeal.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-medium">Live Ad</span>
          </div>
        </div>
      </div>
    </main>
  )
}
