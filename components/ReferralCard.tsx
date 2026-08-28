'use client'

import React, { useState } from 'react'

interface ReferralCardProps {
  referralCode: string
  credits: number
  referredCount: number
}

export default function ReferralCard({ referralCode, credits, referredCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${referralCode}` : `https://prox.app/login?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-1">Affiliate & Referrals</h3>
        <p className="text-xs text-gray-500">Invite business owners and get free post credits.</p>
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
