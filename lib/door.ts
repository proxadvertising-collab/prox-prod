export type ProxDoor = 'shopper' | 'business' | 'affiliate'

const KEY = 'prox_door'
const YEAR = 60 * 60 * 24 * 365

export function getDoor(): ProxDoor | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(KEY)
    if (v === 'shopper' || v === 'business' || v === 'affiliate') return v
  } catch {}
  return null
}

export function setDoor(door: ProxDoor) {
  try {
    window.localStorage.setItem(KEY, door)
  } catch {}
  document.cookie = `${KEY}=${door}; path=/; max-age=${YEAR}`
}

export function clearDoor() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {}
  document.cookie = `${KEY}=; path=/; max-age=0`
}
