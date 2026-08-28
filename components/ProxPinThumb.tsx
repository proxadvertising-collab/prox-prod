'use client'

import React, { useState } from 'react'

interface ProxPinThumbProps {
  size?: number
}

export default function ProxPinThumb({ size = 36 }: ProxPinThumbProps) {
  const [imgFailed, setImgFailed] = useState(false)

  if (!imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/prox-pin.png"
        alt="Prox pin"
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        style={{
          width: size,
          height: size,
          filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))',
          pointerEvents: 'none',
        }}
      />
    )
  }

  // CSS fallback pin: white glossy teardrop, inner navy circle badge,
  // hairline P/R/O/X at compass points, thin crosshair.
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(45deg)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3ecff 50%, #ffffff 100%)',
        boxShadow: '0 0 20px rgba(124,58,237,0.6)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.5,
          height: size * 0.5,
          background: '#141432',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '0.5px',
            background: 'rgba(255,255,255,0.5)',
            transform: 'rotate(45deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '0.5px',
            background: 'rgba(255,255,255,0.5)',
            transform: 'rotate(-45deg)',
          }}
        />
        <span style={{ position: 'absolute', top: '2px', fontSize: '7px', fontWeight: 100, color: '#fff' }}>P</span>
        <span style={{ position: 'absolute', right: '2px', fontSize: '7px', fontWeight: 100, color: '#fff' }}>R</span>
        <span style={{ position: 'absolute', bottom: '2px', fontSize: '7px', fontWeight: 100, color: '#fff' }}>O</span>
        <span style={{ position: 'absolute', left: '2px', fontSize: '7px', fontWeight: 100, color: '#fff' }}>X</span>
      </div>
    </div>
  )
}
