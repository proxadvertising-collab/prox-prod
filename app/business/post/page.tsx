'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function BusinessPostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('37.7749')
  const [lng, setLng] = useState('-122.4194')
  const [businessId, setBusinessId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [languageCode, setLanguageCode] = useState('en')
  const [loadingAi, setLoadingAi] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleAiGenerate = async () => {
    if (!description.trim()) {
      setMessage('Please enter a description first.')
      return
    }
    setLoadingAi(true)
    setMessage('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: description }),
      })
      const data = await res.json()
      if (data.title) setTitle(data.title)
      else setMessage(data.error || 'Failed to generate title')
    } catch (err: any) {
      setMessage(err.message || 'Error calling AI')
    } finally {
      setLoadingAi(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    const supabase = createBrowserClient()

    const { error } = await supabase.from('deals').insert({
      title,
      description,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      business_id: businessId,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 3600000).toISOString(),
      price_display: priceDisplay || null,
      currency_code: currencyCode,
      language_code: languageCode,
    })

    setSubmitting(false)
    if (error) {
      setMessage('Error posting deal: ' + error.message)
    } else {
      setMessage('Deal posted successfully!')
      setTitle('')
      setDescription('')
      setPriceDisplay('')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Deal</h1>
        {message && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business ID (UUID)</label>
            <input
              type="text"
              required
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="UUID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Description..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={loadingAi}
                className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md hover:bg-purple-200"
              >
                ✨ {loadingAi ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Display</label>
              <input
                type="text"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. 19.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="THB">THB</option>
                <option value="JPY">JPY</option>
                <option value="BRL">BRL</option>
                <option value="INR">INR</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
            <input
              type="datetime-local"
              required
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            {submitting ? 'Posting...' : 'Publish Deal'}
          </button>
        </form>
      </div>
    </main>
  )
}
