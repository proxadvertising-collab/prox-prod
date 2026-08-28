'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 max-w-md mx-auto flex items-center justify-around px-6 shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-full h-full text-sm font-semibold transition-colors ${
          pathname === '/' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <span className="text-xl">🏠</span>
        <span className="text-xs mt-0.5">Feed</span>
      </Link>
      <Link
        href="/business/post"
        className={`flex flex-col items-center justify-center w-full h-full text-sm font-semibold transition-colors ${
          pathname === '/business/post' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <span className="text-xl">➕</span>
        <span className="text-xs mt-0.5">Post</span>
      </Link>
    </nav>
  )
}
