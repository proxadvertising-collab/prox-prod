const METERS_PER_MI = 1609.34

export function openGoNow(
  lat: number,
  lng: number,
  distanceMeters?: number | null
) {
  const mode =
    distanceMeters != null && distanceMeters < METERS_PER_MI ? 'walking' : 'driving'
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`
  window.open(url, '_blank')
}
