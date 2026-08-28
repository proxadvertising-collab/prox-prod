'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 max-w-[430px] mx-auto flex items-center justify-around px-4 shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition-colors ${
          pathname === '/' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <span className="text-xl">🏠</span>
        <span className="mt-0.5">Feed</span>
      </Link>
      <Link
        href="/post"
        className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition-colors ${
          pathname === '/post' || pathname === '/business/post' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <span className="text-xl">➕</span>
        <span className="mt-0.5">Post</span>
      </Link>
      <Link
        href="/account"
        className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition-colors ${
          pathname === '/account' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <span className="text-xl">👤</span>
        <span className="mt-0.5">Account</span>
      </Link>
    </nav>
  )
}
