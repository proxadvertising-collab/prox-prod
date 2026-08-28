import React from 'react'

interface ProxPinThumbProps {
  size?: number
}

export default function ProxPinThumb({ size = 36 }: ProxPinThumbProps) {
  return (
    <svg
      width={size}
      height={size * 1.28}
      viewBox="0 0 100 128"
      style={{ filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.6))' }}
    >
      <defs>
        <linearGradient id="proxPearl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f3ecff" />
          <stop offset="60%" stopColor="#ffe9f2" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Teardrop pin body */}
      <path
        d="M50,4
           C75,4 96,25 96,50
           C96,68 82,86 50,124
           C18,86 4,68 4,50
           C4,25 25,4 50,4 Z"
        fill="url(#proxPearl)"
        stroke="#e8e4f4"
        strokeWidth="1"
      />

      {/* Inner navy-bordered circle */}
      <circle cx="50" cy="48" r="27" fill="#ffffff" stroke="#12203c" strokeWidth="2.5" />

      {/* Crosshair (X) */}
      <line x1="27" y1="25" x2="73" y2="71" stroke="#12203c" strokeWidth="1" />
      <line x1="73" y1="25" x2="27" y2="71" stroke="#12203c" strokeWidth="1" />

      {/* P R O X letters at compass points */}
      <text x="50" y="30" textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#12203c">P</text>
      <text x="72" y="52" textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#12203c">R</text>
      <text x="50" y="70" textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#12203c">O</text>
      <text x="28" y="52" textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#12203c">X</text>
    </svg>
  )
}
