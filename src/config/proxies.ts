export type ProxyProvider = {
  id: string
  name: string
  url: string
  region: string
  notes?: string
  priority: number
}

export const proxyProviders: ProxyProvider[] = [
  { id: 'hide-me', name: 'Hide.me', url: 'https://hide.me', region: 'Global', notes: 'Free web proxy', priority: 1 },
  { id: 'croxyproxy', name: 'CroxyProxy', url: 'https://croxyproxy.com', region: 'Global', notes: 'Web proxy', priority: 2 },
  { id: 'proxysite', name: 'ProxySite', url: 'https://proxysite.com', region: 'Global', notes: 'Web proxy', priority: 3 },
  { id: '4everproxy', name: '4everproxy', url: 'https://4everproxy.com', region: 'Global', notes: 'Web proxy', priority: 4 },
  { id: 'blockaway', name: 'BlockAway', url: 'https://blockaway.net', region: 'Global', notes: 'Web proxy', priority: 5 },
  { id: 'proxyium', name: 'Proxyium', url: 'https://proxyium.com', region: 'Global', notes: 'Web proxy', priority: 6 },
  { id: 'proxfree', name: 'ProxFree', url: 'https://proxfree.com', region: 'Global', notes: 'Web proxy', priority: 7 },
  { id: 'anonymouse', name: 'Anonymouse', url: 'https://anonymouse.org', region: 'Global', notes: 'Web proxy', priority: 8 },
  { id: 'genmirror', name: 'GenMirror', url: 'https://genmirror.com', region: 'Global', notes: 'Web proxy', priority: 9 },
  { id: 'vpnbook', name: 'VPNBook', url: 'https://vpnbook.com', region: 'Global', notes: 'Free VPN and proxy', priority: 10 },
  { id: 'awebproxy', name: 'AWebProxy', url: 'https://awebproxy.com', region: 'Global', notes: 'Web proxy', priority: 11 },
  { id: 'my-proxy', name: 'My-Proxy', url: 'https://my-proxy.com', region: 'Global', notes: 'Proxy list', priority: 12 },
  { id: 'proxysite-cloud', name: 'ProxySite.cloud', url: 'https://proxysite.cloud', region: 'Global', notes: 'Web proxy', priority: 13 },
  { id: 'zalmos', name: 'Zalmos', url: 'https://zalmos.com', region: 'Global', notes: 'Web proxy', priority: 14 },
  { id: 'unblockyoutube-video', name: 'UnblockYouTube.video', url: 'https://unblockyoutube.video', region: 'Global', notes: 'YouTube proxy', priority: 15 },
  { id: 'weboproxy', name: 'WebOProxy', url: 'https://weboproxy.com', region: 'Global', notes: 'Web proxy', priority: 16 },
  { id: 'turbohide', name: 'TurboHide', url: 'https://turbohide.org', region: 'Global', notes: 'Web proxy', priority: 17 },
  { id: 'megaproxy', name: 'MegaProxy', url: 'https://megaproxy.com.ar', region: 'Global', notes: 'Web proxy', priority: 18 },
  { id: 'dontfilter', name: 'DontFilter', url: 'https://dontfilter.us', region: 'Global', notes: 'Web proxy', priority: 19 },
  { id: 'unblockvideos', name: 'UnblockVideos', url: 'https://unblockvideos.com', region: 'Global', notes: 'Video proxy', priority: 20 },
  { id: 'freeproxy-win', name: 'FreeProxy.win', url: 'https://freeproxy.win', region: 'Global', notes: 'Web proxy', priority: 21 },
  { id: 'instantunblock', name: 'InstantUnblock', url: 'https://instantunblock.com', region: 'Global', notes: 'Web proxy', priority: 22 },
  { id: 'sslsecureproxy', name: 'SSL Secure Proxy', url: 'https://sslsecureproxy.com', region: 'Global', notes: 'Web proxy', priority: 23 },
  { id: 'proxylistpro', name: 'ProxyListPro', url: 'https://proxylistpro.com', region: 'Global', notes: 'Proxy list', priority: 24 },
  { id: 'youtubeunblocked', name: 'YouTubeUnblocked.live', url: 'https://youtubeunblocked.live', region: 'Global', notes: 'YouTube proxy', priority: 25 },
  { id: 'unblockproxy', name: 'UnblockProxy', url: 'https://unblockproxy.win', region: 'Global', notes: 'Web proxy', priority: 26 },
  { id: 'proxysite-one', name: 'ProxySite.one', url: 'https://proxysite.one', region: 'Global', notes: 'Web proxy', priority: 27 },
  { id: 'myiphide', name: 'MyIPHide', url: 'https://myiphide.com', region: 'Global', notes: 'Web proxy', priority: 28 },
  { id: 'unblock-websites', name: 'Unblock-Websites', url: 'https://unblock-websites.com', region: 'Global', notes: 'Web proxy', priority: 29 },
  { id: 'proxy-youtube', name: 'Proxy-YouTube', url: 'https://proxy-youtube.com', region: 'Global', notes: 'YouTube proxy', priority: 30 },
  { id: 'zend2', name: 'Zend2', url: 'https://zend2.com', region: 'Global', notes: 'Web proxy', priority: 31 },
  { id: 'proxify', name: 'Proxify', url: 'https://proxify.com', region: 'Global', notes: 'Web proxy', priority: 32 },
  { id: 'privateproxy-cloud', name: 'PrivateProxy.cloud', url: 'https://privateproxy.cloud', region: 'Global', notes: 'Web proxy', priority: 33 },
]
