export interface BlockedTarget {
  slug: string
  site: string
  country: string
  status: 'blocked' | 'restricted' | 'monitored'
  alternative?: string
}

export const blockedTargets: BlockedTarget[] = [
  // China blocks
  { slug: 'youtube-china', site: 'YouTube', country: 'China', status: 'blocked' },
  { slug: 'twitter-china', site: 'Twitter/X', country: 'China', status: 'blocked' },
  { slug: 'facebook-china', site: 'Facebook', country: 'China', status: 'blocked' },
  { slug: 'instagram-china', site: 'Instagram', country: 'China', status: 'blocked' },
  { slug: 'netflix-china', site: 'Netflix', country: 'China', status: 'blocked' },
  { slug: 'twitch-china', site: 'Twitch', country: 'China', status: 'blocked' },
  { slug: 'discord-china', site: 'Discord', country: 'China', status: 'blocked' },
  { slug: 'reddit-china', site: 'Reddit', country: 'China', status: 'blocked' },
  { slug: 'whatsapp-china', site: 'WhatsApp', country: 'China', status: 'blocked' },
  { slug: 'telegram-china', site: 'Telegram', country: 'China', status: 'blocked' },
  { slug: 'spotify-china', site: 'Spotify', country: 'China', status: 'blocked' },
  { slug: 'google-china', site: 'Google', country: 'China', status: 'blocked', alternative: 'Baidu' },

  // Russia blocks
  { slug: 'youtube-russia', site: 'YouTube', country: 'Russia', status: 'restricted' },
  { slug: 'twitter-russia', site: 'Twitter/X', country: 'Russia', status: 'restricted' },
  { slug: 'facebook-russia', site: 'Facebook', country: 'Russia', status: 'blocked' },
  { slug: 'instagram-russia', site: 'Instagram', country: 'Russia', status: 'blocked' },
  { slug: 'linkedin-russia', site: 'LinkedIn', country: 'Russia', status: 'blocked' },

  // Iran blocks
  { slug: 'instagram-iran', site: 'Instagram', country: 'Iran', status: 'blocked' },
  { slug: 'telegram-iran', site: 'Telegram', country: 'Iran', status: 'blocked' },
  { slug: 'signal-iran', site: 'Signal', country: 'Iran', status: 'blocked' },
  { slug: 'youtube-iran', site: 'YouTube', country: 'Iran', status: 'blocked' },
  { slug: 'twitter-iran', site: 'Twitter/X', country: 'Iran', status: 'blocked' },
  { slug: 'facebook-iran', site: 'Facebook', country: 'Iran', status: 'blocked' },
  { slug: 'netflix-iran', site: 'Netflix', country: 'Iran', status: 'blocked' },

  // Other countries
  { slug: 'tiktok-india', site: 'TikTok', country: 'India', status: 'blocked' },
  { slug: 'whatsapp-uae', site: 'WhatsApp', country: 'UAE', status: 'restricted' },
  { slug: 'discord-uae', site: 'Discord', country: 'UAE', status: 'restricted' },
  { slug: 'wikipedia-turkey', site: 'Wikipedia', country: 'Turkey', status: 'restricted' },
  { slug: 'reddit-indonesia', site: 'Reddit', country: 'Indonesia', status: 'blocked' },
  { slug: 'roblox-school', site: 'Roblox', country: 'Schools', status: 'blocked' },
  { slug: 'discord-school', site: 'Discord', country: 'Schools', status: 'blocked' },
  { slug: 'spotify-school', site: 'Spotify', country: 'Schools', status: 'blocked' },
  { slug: 'steam-school', site: 'Steam', country: 'Schools', status: 'blocked' },

  // Country-specific streaming blocks
  { slug: 'hulu-outside-us', site: 'Hulu', country: 'Outside US', status: 'blocked' },
  { slug: 'bbc-iplayer-outside-uk', site: 'BBC iPlayer', country: 'Outside UK', status: 'blocked' },
  { slug: 'peacock-outside-us', site: 'Peacock', country: 'Outside US', status: 'blocked' },
  { slug: 'espn-plus-outside-us', site: 'ESPN+', country: 'Outside US', status: 'blocked' },
  { slug: 'pandora-outside-us', site: 'Pandora', country: 'Outside US', status: 'blocked' },

  // Additional restricted content
  { slug: 'chatgpt-china', site: 'ChatGPT', country: 'China', status: 'blocked' },
  { slug: 'chatgpt-iran', site: 'ChatGPT', country: 'Iran', status: 'blocked' },
  { slug: 'chatgpt-russia', site: 'ChatGPT', country: 'Russia', status: 'blocked' },
  { slug: 'claude-china', site: 'Claude', country: 'China', status: 'blocked' },
]

// Helper functions
export function getBlocksByCountry(country: string): BlockedTarget[] {
  return blockedTargets.filter(t => t.country.toLowerCase() === country.toLowerCase())
}

export function getBlocksBySite(site: string): BlockedTarget[] {
  return blockedTargets.filter(t => t.site.toLowerCase().includes(site.toLowerCase()))
}
