export const vpnProviders = [
  {
    slug: 'nordvpn',
    name: 'NordVPN',
    tagline: 'Fastest VPN for streaming and privacy',
    rating: 9.6,
    price: '$3.39/mo',
    highlights: ['6,000+ servers', 'Meshnet', 'Obfuscated servers'],
  },
  {
    slug: 'expressvpn',
    name: 'ExpressVPN',
    tagline: 'Premium speeds with strong security',
    rating: 9.2,
    price: '$6.67/mo',
    highlights: ['94 countries', 'TrustedServer', 'Best-in-class apps'],
  },
  {
    slug: 'surfshark',
    name: 'Surfshark',
    tagline: 'Best value for unlimited devices',
    rating: 9.0,
    price: '$2.49/mo',
    highlights: ['Unlimited devices', 'CleanWeb', 'MultiHop'],
  },
  {
    slug: 'protonvpn',
    name: 'Proton VPN',
    tagline: 'Privacy-first Swiss provider',
    rating: 8.7,
    price: '$4.99/mo',
    highlights: ['Secure Core', 'Open-source apps', 'Strong privacy laws'],
  },
]

export const vpnComparisons = [
  { slug: 'nordvpn-vs-expressvpn', a: 'NordVPN', b: 'ExpressVPN' },
  { slug: 'nordvpn-vs-surfshark', a: 'NordVPN', b: 'Surfshark' },
  { slug: 'expressvpn-vs-surfshark', a: 'ExpressVPN', b: 'Surfshark' },
  { slug: 'nordvpn-vs-protonvpn', a: 'NordVPN', b: 'Proton VPN' },
  { slug: 'expressvpn-vs-protonvpn', a: 'ExpressVPN', b: 'Proton VPN' },
]

export const vpnBestFor = [
  { slug: 'best-for-streaming', title: 'Best VPN for Streaming', focus: 'Netflix, Hulu, Disney+ and more' },
  { slug: 'best-for-gaming', title: 'Best VPN for Gaming', focus: 'Low ping and stable servers' },
  { slug: 'best-for-china', title: 'Best VPN for China', focus: 'Obfuscation and reliable access' },
  { slug: 'best-for-privacy', title: 'Best VPN for Privacy', focus: 'No-logs, audited providers' },
]
