'use client'

import React from 'react'
import AuthButton from '@/components/AuthButton'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Welcome to Prox</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Sign in to post live deals and manage your business.</p>
        <AuthButton />
      </div>
    </main>
  )
}
