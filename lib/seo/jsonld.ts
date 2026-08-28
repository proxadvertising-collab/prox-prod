export function generateLocalBusinessJsonLd(business: {
  name: string
  lat: number
  lng: number
  currencyCode?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.lat,
      longitude: business.lng,
    },
    currenciesAccepted: business.currencyCode || 'USD',
  }
}
