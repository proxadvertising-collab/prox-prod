export interface Deal {
  id: string
  title: string
  description: string
  lat: number
  lng: number
  expires_at: string
  business_id: string
  price_display?: string
  currency_code?: string
  language_code?: string
  created_at?: string
}
