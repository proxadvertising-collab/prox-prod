'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyDomTheme(next: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', next)
  root.style.colorScheme = next
  document.body.style.background = next === 'dark' ? '#0B0B12' : '#F7F3FB'
  document.body.style.color = next === 'dark' ? '#F7F3FB' : '#1A1523'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    let initial: Theme = 'dark'
    try {
      const stored = window.localStorage.getItem('prox-theme')
      if (stored === 'light' || stored === 'dark') initial = stored
    } catch {}
    setTheme(initial)
    applyDomTheme(initial)
  }, [])

  const lockRef = useRef(false)
  const toggleTheme = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    window.setTimeout(() => {
      lockRef.current = false
    }, 400)
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem('prox-theme', next)
      } catch {}
      applyDomTheme(next)
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
