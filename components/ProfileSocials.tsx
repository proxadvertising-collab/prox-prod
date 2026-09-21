'use client'

type SocialProfile = {
  instagram_url?: string | null
  facebook_url?: string | null
  tiktok_url?: string | null
  yelp_url?: string | null
  google_maps_url?: string | null
  website_url?: string | null
}

const LINKS: { key: keyof SocialProfile; label: string }[] = [
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'tiktok_url', label: 'TikTok' },
  { key: 'yelp_url', label: 'Yelp' },
  { key: 'google_maps_url', label: 'Google Maps' },
  { key: 'website_url', label: 'Website' },
]

export default function ProfileSocials({
  profile,
  textColor,
  compact = false,
}: {
  profile?: SocialProfile | null
  textColor: string
  compact?: boolean
}) {
  if (!profile) return null
  const items = LINKS.filter((item) => profile[item.key])
  if (items.length === 0) return null

  return (
    <div
      className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <a
          key={item.key}
          href={profile[item.key] as string}
          target="_blank"
          rel="noreferrer"
          className={`rounded-lg font-medium ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}`}
          style={{ background: 'rgba(93,32,181,0.1)', color: textColor }}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
