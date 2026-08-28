'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <footer
      className={`py-8 px-6 mt-auto ${isDark ? 'border-t border-white/10' : 'border-t border-violet-900/10'}`}
    >
      <div
        className={`max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm ${
          isDark ? 'text-white/50' : 'text-gray-500'
        }`}
      >
        <p>&copy; {new Date().getFullYear()} Prox. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link>
          <a href="mailto:support@prox.app" className="hover:text-violet-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
