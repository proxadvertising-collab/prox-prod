'use client'

import React, { useState } from 'react'

interface ReferralCardProps {
  referralCode: string
  credits: number
  referredCount: number
}

export default function ReferralCard({ referralCode, credits, referredCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://prox.app'
  const link = `${origin}/signup?ref=${referralCode}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-1">Your invite</h3>
        <p className="text-xs text-gray-500">Share this with a business. They sign up with your code.</p>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your code</p>
        <p className="text-3xl font-black tracking-[0.2em] text-gray-900">{referralCode}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <img src={qrSrc} alt="Referral QR" width={200} height={200} className="rounded-xl border border-gray-100" />
        <p className="text-xs text-gray-500 text-center">Business scans this to sign up with your code.</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Free Post Credits:</span>
          <span className="font-black text-gray-900">{credits}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Referred Owners:</span>
          <span className="font-black text-gray-900">{referredCount}</span>
        </div>
        {credits === 0 && referredCount === 0 ? (
          <p className="text-xs text-gray-500 pt-1">Share your QR — credits show up when a business pays.</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-700 uppercase">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={link}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="bg-black text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-800 transition-colors shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
