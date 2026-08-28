'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function AuthButton() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
  }

  return (
    <div className="space-y-4 w-full max-w-sm">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2"
      >
        <span>🌐</span> Sign in with Google
      </button>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm"
        >
          {loading ? 'Sending link...' : 'Send Magic Link'}
        </button>
      </form>

      {message && <p className="text-xs text-center text-gray-600 mt-2">{message}</p>}
    </div>
  )
}
