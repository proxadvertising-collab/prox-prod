import Link from 'next/link'
import React from 'react'

export function Script({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line">
      {children}
    </div>
  )
}

export function BackToHub() {
  return (
    <Link href="/affiliates/playbook" className="text-sm text-[#7C3AED] underline underline-offset-4">
      ← Back to the playbook
    </Link>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card-dark p-5 space-y-3">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  )
}
