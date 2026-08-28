export interface Profile {
  id: string
  email?: string
  referral_code?: string
  referred_by?: string
  credits?: number
  instagram_url?: string
  facebook_url?: string
  tiktok_url?: string
  yelp_url?: string
  google_maps_url?: string
  website_url?: string
  created_at?: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  description?: string
  lat: number
  lng: number
  address?: string
  currency?: string
  created_at?: string
}

export interface Deal {
  id: string
  business_id: string
  owner_id: string
  title: string
  description: string
  price_display?: string
  original_price?: string
  discount_percent?: number
  lat: number
  lng: number
  expires_at?: string
  is_active: boolean
  post_type?: 'deal' | 'open'
  image_url?: string
  created_at?: string
}
