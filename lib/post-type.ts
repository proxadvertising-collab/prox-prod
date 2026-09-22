export const POST_TYPES = ['deal', 'open', 'special', 'closed_early'] as const
export type PostType = (typeof POST_TYPES)[number]

export function isPostType(value: string): value is PostType {
  return (POST_TYPES as readonly string[]).includes(value)
}

export function postTypeLabel(value?: string | null): string {
  switch (value) {
    case 'open':
      return "We're Open"
    case 'special':
      return 'Special'
    case 'closed_early':
      return 'Closing early'
    default:
      return 'Deal'
  }
}
