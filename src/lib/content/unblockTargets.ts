export interface UnblockTarget {
  slug: string
  name: string
  category: 'Streaming' | 'Social' | 'Gaming' | 'Music' | 'AI' | 'Messaging' | 'Education' | 'Shopping' | 'Search' | 'Development' | 'Community'
  summary: string
  blockedIn?: string[]
  url?: string
  popularity?: number
}

export const unblockTargets: UnblockTarget[] = [
  // Streaming Services
  { slug: 'youtube', name: 'YouTube', category: 'Streaming', summary: 'Video platform blocked in China, Iran, Pakistan, and some schools.', blockedIn: ['China', 'Iran', 'Pakistan'], url: 'youtube.com', popularity: 100 },
  { slug: 'netflix', name: 'Netflix', category: 'Streaming', summary: 'Streaming service with region-specific content libraries.', blockedIn: ['China', 'Russia', 'Syria'], url: 'netflix.com', popularity: 95 },
  { slug: 'hulu', name: 'Hulu', category: 'Streaming', summary: 'US-only streaming service with geo-restrictions.', blockedIn: ['Outside US'], url: 'hulu.com', popularity: 85 },
  { slug: 'disney-plus', name: 'Disney+', category: 'Streaming', summary: 'Disney streaming blocked in some regions.', blockedIn: ['Some regions'], url: 'disneyplus.com', popularity: 90 },
  { slug: 'bbc-iplayer', name: 'BBC iPlayer', category: 'Streaming', summary: 'UK-only streaming service.', blockedIn: ['Outside UK'], url: 'bbc.co.uk/iplayer', popularity: 75 },
  { slug: 'hbo-max', name: 'HBO Max', category: 'Streaming', summary: 'Warner streaming service limited to Americas.', blockedIn: ['Outside US/LATAM'], url: 'hbomax.com', popularity: 70 },
  { slug: 'paramount-plus', name: 'Paramount+', category: 'Streaming', summary: 'Paramount streaming with geo-blocks.', blockedIn: ['Some regions'], url: 'paramountplus.com', popularity: 65 },
  { slug: 'peacock', name: 'Peacock', category: 'Streaming', summary: 'NBC streaming service limited to US.', blockedIn: ['Outside US'], url: 'peacocktv.com', popularity: 60 },
  { slug: 'amazon-prime', name: 'Prime Video', category: 'Streaming', summary: 'Amazon streaming with regional content.', blockedIn: ['Some regions'], url: 'primevideo.com', popularity: 88 },
  { slug: 'twitch', name: 'Twitch', category: 'Streaming', summary: 'Live streaming platform blocked in China and Russia.', blockedIn: ['China', 'Russia'], url: 'twitch.tv', popularity: 80 },
  { slug: 'crunchyroll', name: 'Crunchyroll', category: 'Streaming', summary: 'Anime streaming with regional restrictions.', blockedIn: ['Some regions'], url: 'crunchyroll.com', popularity: 55 },
  { slug: 'espn-plus', name: 'ESPN+', category: 'Streaming', summary: 'Sports streaming limited to United States.', blockedIn: ['Outside US'], url: 'espn.com', popularity: 50 },
  { slug: 'hulu-live', name: 'Hulu Live', category: 'Streaming', summary: 'Live TV streaming blocked outside US.', blockedIn: ['Outside US'], url: 'hulu.com/live', popularity: 45 },

  // Social Media
  { slug: 'twitter', name: 'Twitter/X', category: 'Social', summary: 'Social network restricted in China, Iran, Russia.', blockedIn: ['China', 'Iran', 'Russia'], url: 'x.com', popularity: 95 },
  { slug: 'facebook', name: 'Facebook', category: 'Social', summary: 'Social network blocked in China, Iran, Bangladesh.', blockedIn: ['China', 'Iran', 'Bangladesh'], url: 'facebook.com', popularity: 92 },
  { slug: 'instagram', name: 'Instagram', category: 'Social', summary: 'Photo platform blocked in China, Iran, North Korea.', blockedIn: ['China', 'Iran', 'North Korea'], url: 'instagram.com', popularity: 90 },
  { slug: 'tiktok', name: 'TikTok', category: 'Social', summary: 'Short video app blocked in India and schools.', blockedIn: ['India', 'Some schools'], url: 'tiktok.com', popularity: 93 },
  { slug: 'reddit', name: 'Reddit', category: 'Social', summary: 'Discussion platform blocked in China and Indonesia.', blockedIn: ['China', 'Indonesia'], url: 'reddit.com', popularity: 85 },
  { slug: 'pinterest', name: 'Pinterest', category: 'Social', summary: 'Image platform with some regional blocks.', blockedIn: ['Some regions'], url: 'pinterest.com', popularity: 60 },
  { slug: 'snapchat', name: 'Snapchat', category: 'Social', summary: 'Social app blocked in China and schools.', blockedIn: ['China', 'Some schools'], url: 'snapchat.com', popularity: 70 },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Social', summary: 'Professional network blocked in China and Russia.', blockedIn: ['China', 'Russia'], url: 'linkedin.com', popularity: 65 },
  { slug: 'tumblr', name: 'Tumblr', category: 'Social', summary: 'Microblogging platform with some restrictions.', blockedIn: ['Some regions'], url: 'tumblr.com', popularity: 40 },
  { slug: 'quora', name: 'Quora', category: 'Social', summary: 'Q&A platform blocked in some regions.', blockedIn: ['Some regions'], url: 'quora.com', popularity: 55 },

  // Messaging Apps
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging', summary: 'Messaging blocked in China, UAE, and Iran.', blockedIn: ['China', 'UAE', 'Iran'], url: 'whatsapp.com', popularity: 90 },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging', summary: 'Secure messaging blocked in China and Iran.', blockedIn: ['China', 'Iran'], url: 'telegram.org', popularity: 82 },
  { slug: 'signal', name: 'Signal', category: 'Messaging', summary: 'Encrypted messaging blocked in some regions.', blockedIn: ['Some regions'], url: 'signal.org', popularity: 60 },
  { slug: 'discord', name: 'Discord', category: 'Messaging', summary: 'Chat app blocked in China and schools.', blockedIn: ['China', 'Some schools'], url: 'discord.com', popularity: 85 },
  { slug: 'viber', name: 'Viber', category: 'Messaging', summary: 'VoIP app restricted in some countries.', blockedIn: ['Some regions'], url: 'viber.com', popularity: 50 },
  { slug: 'wechat', name: 'WeChat', category: 'Messaging', summary: 'Chinese messaging with some access issues.', blockedIn: ['Some regions'], url: 'wechat.com', popularity: 45 },
  { slug: 'line', name: 'LINE', category: 'Messaging', summary: 'Japanese messaging popular in Asia.', blockedIn: ['Some regions'], url: 'line.me', popularity: 55 },
  { slug: 'threema', name: 'Threema', category: 'Messaging', summary: 'Secure Swiss messaging app.', blockedIn: ['Some regions'], url: 'threema.ch', popularity: 30 },

  // Gaming
  { slug: 'roblox', name: 'Roblox', category: 'Gaming', summary: 'Gaming platform blocked at schools worldwide.', blockedIn: ['Some schools'], url: 'roblox.com', popularity: 88 },
  { slug: 'steam', name: 'Steam', category: 'Gaming', summary: 'Game store blocked in China and schools.', blockedIn: ['China', 'Some schools'], url: 'steampowered.com', popularity: 85 },
  { slug: 'epic-games', name: 'Epic Games', category: 'Gaming', summary: 'Game store with some regional blocks.', blockedIn: ['Some regions'], url: 'epicgames.com', popularity: 70 },
  { slug: 'origin', name: 'Origin', category: 'Gaming', summary: 'EA gaming platform restricted in some regions.', blockedIn: ['Some regions'], url: 'origin.com', popularity: 50 },
  { slug: 'battle-net', name: 'Battle.net', category: 'Gaming', summary: 'Blizzard gaming with regional restrictions.', blockedIn: ['Some regions'], url: 'blizzard.com', popularity: 60 },
  { slug: 'minecraft', name: 'Minecraft', category: 'Gaming', summary: 'Game blocked at some schools.', blockedIn: ['Some schools'], url: 'minecraft.net', popularity: 75 },
  { slug: 'fortnite', name: 'Fortnite', category: 'Gaming', summary: 'Battle royale blocked in some regions.', blockedIn: ['Some regions'], url: 'fortnite.com', popularity: 80 },

  // Music
  { slug: 'spotify', name: 'Spotify', category: 'Music', summary: 'Music streaming with regional content differences.', blockedIn: ['Some regions'], url: 'spotify.com', popularity: 90 },
  { slug: 'apple-music', name: 'Apple Music', category: 'Music', summary: 'Apple streaming with geo-restrictions.', blockedIn: ['Some regions'], url: 'music.apple.com', popularity: 75 },
  { slug: 'youtube-music', name: 'YouTube Music', category: 'Music', summary: 'Google music blocked in some regions.', blockedIn: ['Some regions'], url: 'music.youtube.com', popularity: 70 },
  { slug: 'soundcloud', name: 'SoundCloud', category: 'Music', summary: 'Audio platform with some blocks.', blockedIn: ['Some regions'], url: 'soundcloud.com', popularity: 60 },
  { slug: 'pandora', name: 'Pandora', category: 'Music', summary: 'Radio streaming limited to United States.', blockedIn: ['Outside US'], url: 'pandora.com', popularity: 40 },
  { slug: 'deezer', name: 'Deezer', category: 'Music', summary: 'Music streaming with regional availability.', blockedIn: ['Some regions'], url: 'deezer.com', popularity: 45 },
  { slug: 'tidal', name: 'Tidal', category: 'Music', summary: 'High-fidelity music with restrictions.', blockedIn: ['Some regions'], url: 'tidal.com', popularity: 35 },
  { slug: 'bandcamp', name: 'Bandcamp', category: 'Music', summary: 'Independent music platform.', blockedIn: ['Some regions'], url: 'bandcamp.com', popularity: 40 },

  // AI Tools
  { slug: 'chatgpt', name: 'ChatGPT', category: 'AI', summary: 'OpenAI blocked in China, Iran, Russia.', blockedIn: ['China', 'Iran', 'Russia'], url: 'chat.openai.com', popularity: 95 },
  { slug: 'claude', name: 'Claude', category: 'AI', summary: 'Anthropic AI blocked in some regions.', blockedIn: ['Some regions'], url: 'claude.ai', popularity: 70 },
  { slug: 'midjourney', name: 'Midjourney', category: 'AI', summary: 'AI image generator with restrictions.', blockedIn: ['Some regions'], url: 'midjourney.com', popularity: 65 },
  { slug: 'character-ai', name: 'Character.AI', category: 'AI', summary: 'AI chatbot blocked in some regions.', blockedIn: ['Some regions'], url: 'character.ai', popularity: 60 },
  { slug: 'perplexity', name: 'Perplexity', category: 'AI', summary: 'AI search engine with some blocks.', blockedIn: ['Some regions'], url: 'perplexity.ai', popularity: 50 },

  // Education & Reference
  { slug: 'wikipedia', name: 'Wikipedia', category: 'Education', summary: 'Encyclopedia censored in China and schools.', blockedIn: ['China', 'Some schools'], url: 'wikipedia.org', popularity: 95 },
  { slug: 'google', name: 'Google', category: 'Search', summary: 'Search engine blocked in China.', blockedIn: ['China'], url: 'google.com', popularity: 100 },
  { slug: 'github', name: 'GitHub', category: 'Development', summary: 'Code repository blocked in some regions.', blockedIn: ['Some regions'], url: 'github.com', popularity: 85 },
  { slug: 'stack-overflow', name: 'Stack Overflow', category: 'Development', summary: 'Developer Q&A blocked at some schools.', blockedIn: ['Some schools'], url: 'stackoverflow.com', popularity: 75 },
  { slug: 'khan-academy', name: 'Khan Academy', category: 'Education', summary: 'Learning platform blocked in some regions.', blockedIn: ['Some regions'], url: 'khanacademy.org', popularity: 55 },
  { slug: 'coursera', name: 'Coursera', category: 'Education', summary: 'Online courses with regional blocks.', blockedIn: ['Some regions'], url: 'coursera.org', popularity: 60 },
  { slug: 'udemy', name: 'Udemy', category: 'Education', summary: 'Course platform blocked in some regions.', blockedIn: ['Some regions'], url: 'udemy.com', popularity: 55 },

  // Shopping
  { slug: 'amazon', name: 'Amazon', category: 'Shopping', summary: 'Shopping with regional variations.', blockedIn: ['Some regions'], url: 'amazon.com', popularity: 95 },
  { slug: 'ebay', name: 'eBay', category: 'Shopping', summary: 'Marketplace blocked in some regions.', blockedIn: ['Some regions'], url: 'ebay.com', popularity: 70 },
  { slug: 'etsy', name: 'Etsy', category: 'Shopping', summary: 'Handmade goods with geo-blocks.', blockedIn: ['Some regions'], url: 'etsy.com', popularity: 60 },]

// Helper function to get targets by category
export function getTargetsByCategory(category: UnblockTarget['category']): UnblockTarget[] {
  return unblockTargets.filter(target => target.category === category)
}

// Helper function to get popular targets
export function getPopularTargets(limit = 10): UnblockTarget[] {
  return unblockTargets
    .filter(target => target.popularity !== undefined)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

// Helper function to get related targets
export function getRelatedTargets(slug: string, limit = 6): UnblockTarget[] {
  const target = unblockTargets.find(t => t.slug === slug)
  if (!target) return []

  return unblockTargets
    .filter(t => t.slug !== slug && t.category === target.category)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

// Helper function to search targets
export function searchTargets(query: string): UnblockTarget[] {
  const lowerQuery = query.toLowerCase()
  return unblockTargets.filter(target =>
    target.name.toLowerCase().includes(lowerQuery) ||
    target.slug.includes(lowerQuery) ||
    target.category.toLowerCase().includes(lowerQuery)
  )
}
