export type GuideCategory = 'all' | 'streaming' | 'social' | 'messaging' | 'gaming' | 'privacy'

export interface GuideItem {
  slug: string
  href: string
  title: string
  description: string
  category: Exclude<GuideCategory, 'all'>
  featured?: boolean
}

export const guides: GuideItem[] = [
  {
    slug: 'unblock-youtube',
    href: '/unblock/youtube',
    title: 'How to Unblock YouTube',
    description: 'Access YouTube anywhere with these proven methods.',
    category: 'streaming',
    featured: true,
  },
  {
    slug: 'unblock-netflix',
    href: '/unblock/netflix',
    title: 'Unblock Netflix from Anywhere',
    description: 'Watch your favorite shows regardless of location.',
    category: 'streaming',
    featured: true,
  },
  {
    slug: 'bypass-school-restrictions',
    href: '/blocked/discord-school',
    title: 'Bypass School Network Restrictions',
    description: 'Access blocked sites on school networks safely.',
    category: 'privacy',
  },
  {
    slug: 'unblock-twitter',
    href: '/unblock/twitter',
    title: 'Access Twitter/X in Restricted Regions',
    description: 'Stay connected even when Twitter is blocked.',
    category: 'social',
  },
  {
    slug: 'unblock-discord',
    href: '/unblock/discord',
    title: 'Unblock Discord at School or Work',
    description: 'Chat with friends on restricted networks.',
    category: 'gaming',
  },
  {
    slug: 'unblock-telegram',
    href: '/unblock/telegram',
    title: 'Access Telegram Anywhere',
    description: 'Bypass government censorship for Telegram.',
    category: 'messaging',
  },
  {
    slug: 'unlock-hulu',
    href: '/unblock/hulu',
    title: 'Watch Hulu Outside the US',
    description: 'Stream Hulu from anywhere in the world.',
    category: 'streaming',
  },
  {
    slug: 'unblock-instagram',
    href: '/unblock/instagram',
    title: 'Unblock Instagram on Restricted Networks',
    description: 'Access your social media accounts anywhere.',
    category: 'social',
  },
  {
    slug: 'vpn-for-china',
    href: '/vpn/best-for-china',
    title: 'Best VPNs for China',
    description: 'Reliable VPNs that work in China.',
    category: 'privacy',
    featured: true,
  },
  {
    slug: 'unblock-reddit',
    href: '/unblock/reddit',
    title: 'How to Unblock Reddit',
    description: 'Access Reddit from anywhere.',
    category: 'social',
  },
  {
    slug: 'unblock-signal',
    href: '/unblock/signal',
    title: 'Use Signal in Censored Countries',
    description: 'Secure messaging access worldwide.',
    category: 'messaging',
  },
  {
    slug: 'gaming-vpn-guide',
    href: '/vpn/best-for-gaming',
    title: 'Best VPNs for Gaming',
    description: 'Low-latency VPNs for online gaming.',
    category: 'gaming',
  },
]

export const guideCategories: Array<{
  value: GuideCategory
  label: string
  count: number
}> = [
  { value: 'all', label: 'All Guides', count: guides.length },
  {
    value: 'streaming',
    label: 'Streaming',
    count: guides.filter((guide) => guide.category === 'streaming').length,
  },
  {
    value: 'social',
    label: 'Social Media',
    count: guides.filter((guide) => guide.category === 'social').length,
  },
  {
    value: 'messaging',
    label: 'Messaging',
    count: guides.filter((guide) => guide.category === 'messaging').length,
  },
  {
    value: 'gaming',
    label: 'Gaming',
    count: guides.filter((guide) => guide.category === 'gaming').length,
  },
  {
    value: 'privacy',
    label: 'Privacy',
    count: guides.filter((guide) => guide.category === 'privacy').length,
  },
]
