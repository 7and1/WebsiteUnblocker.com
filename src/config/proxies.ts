export type ProxyProvider = {
  id: string
  name: string
  url: string
  region: string
  notes?: string
  priority: number
}

export const proxyProviders: ProxyProvider[] = [
  { id: 'hide-me-proxy', name: 'Hide.me', url: 'https://hide.me/en/proxy', region: 'Global', notes: 'Web proxy', priority: 1 },
  { id: 'croxyproxy', name: 'CroxyProxy', url: 'https://www.croxyproxy.com/', region: 'Global', notes: 'Web proxy', priority: 2 },
  { id: 'proxysite', name: 'ProxySite', url: 'https://www.proxysite.com/', region: 'Global', notes: 'Web proxy', priority: 3 },
  { id: 'blockaway', name: 'BlockAway', url: 'https://www.blockaway.net/', region: 'Global', notes: 'Web proxy', priority: 4 },
  { id: 'anonymouse', name: 'Anonymouse', url: 'http://anonymouse.org/', region: 'Global', notes: 'Web proxy', priority: 5 },
  { id: 'proxyium', name: 'Proxyium', url: 'https://proxyium.com/', region: 'Global', notes: 'Web proxy', priority: 6 },
  { id: 'awebproxy', name: 'AWebProxy', url: 'https://www.awebproxy.com/', region: 'Global', notes: 'Web proxy', priority: 7 },
  { id: 'vpnbook', name: 'VPNBook', url: 'https://www.vpnbook.com/webproxy', region: 'Global', notes: 'Web proxy', priority: 8 },
  { id: '4everproxy', name: '4everproxy', url: 'https://www.4everproxy.com/proxy', region: 'Global', notes: 'Web proxy', priority: 9 },
  { id: 'genmirror', name: 'GenMirror', url: 'https://www.genmirror.com/', region: 'Global', notes: 'Web proxy', priority: 10 },
  { id: 'proxfree', name: 'ProxFree', url: 'https://www.proxfree.com/', region: 'Global', notes: 'Web proxy', priority: 11 },
  { id: 'my-proxy-webproxy', name: 'My-Proxy Webproxy', url: 'https://www.my-proxy.com/#webproxy', region: 'Global', notes: 'Proxy list', priority: 12 },
  { id: 'my-proxy-list', name: 'My-Proxy List', url: 'https://www.my-proxy.com/free-proxy-list.html', region: 'Global', notes: 'Proxy list', priority: 13 },
  { id: 'proxysite-cloud', name: 'ProxySite.cloud', url: 'https://proxysite.cloud/', region: 'Global', notes: 'Web proxy', priority: 14 },
  { id: 'zalmos', name: 'Zalmos', url: 'https://www.zalmos.com/', region: 'Global', notes: 'Web proxy', priority: 15 },
  { id: 'unblockyoutube-video', name: 'UnblockYouTube.video', url: 'https://unblockyoutube.video/', region: 'Global', notes: 'YouTube proxy', priority: 16 },
  { id: 'weboproxy', name: 'WebOProxy', url: 'https://weboproxy.com/', region: 'Global', notes: 'Web proxy', priority: 17 },
  { id: 'turbohide', name: 'TurboHide', url: 'https://www.turbohide.org/', region: 'Global', notes: 'Web proxy', priority: 18 },
  { id: 'megaproxy', name: 'MegaProxy', url: 'https://www.megaproxy.com.ar/', region: 'Global', notes: 'Web proxy', priority: 19 },
  { id: 'dontfilter', name: 'DontFilter', url: 'http://dontfilter.us/', region: 'Global', notes: 'Web proxy', priority: 20 },
  { id: 'unblockvideos', name: 'UnblockVideos', url: 'https://unblockvideos.com/', region: 'Global', notes: 'Web proxy', priority: 21 },
  { id: 'freeproxy-win', name: 'FreeProxy.win', url: 'https://freeproxy.win/', region: 'Global', notes: 'Web proxy', priority: 22 },
  { id: 'instantunblock', name: 'InstantUnblock', url: 'https://instantunblock.com/', region: 'Global', notes: 'Web proxy', priority: 23 },
  { id: 'sslsecureproxy', name: 'SSL Secure Proxy', url: 'https://www.sslsecureproxy.com/', region: 'Global', notes: 'Web proxy', priority: 24 },
  { id: 'proxylistpro', name: 'ProxyListPro', url: 'https://proxylistpro.com/', region: 'Global', notes: 'Proxy list', priority: 25 },
  { id: 'youtubeunblocked', name: 'YouTubeUnblocked.live', url: 'https://www.youtubeunblocked.live/', region: 'Global', notes: 'YouTube proxy', priority: 26 },
  { id: 'unblockproxy', name: 'UnblockProxy', url: 'https://unblockproxy.win/', region: 'Global', notes: 'Web proxy', priority: 27 },
  { id: 'proxysite-one', name: 'ProxySite.one', url: 'https://proxysite.one/', region: 'Global', notes: 'Web proxy', priority: 28 },
  { id: 'myiphide-proxy', name: 'MyIPHide Proxy', url: 'https://myiphide.com/proxy-site.html', region: 'Global', notes: 'Web proxy', priority: 29 },
  { id: 'myiphide', name: 'MyIPHide', url: 'https://myiphide.com/', region: 'Global', notes: 'Web proxy', priority: 30 },
  { id: 'unblock-websites', name: 'Unblock-Websites', url: 'https://unblock-websites.com/', region: 'Global', notes: 'Web proxy', priority: 31 },
  { id: 'proxy-youtube', name: 'Proxy-YouTube', url: 'https://www.proxy-youtube.com/', region: 'Global', notes: 'Web proxy', priority: 32 },
]
