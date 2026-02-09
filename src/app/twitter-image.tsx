import { ImageResponse } from 'next/og'

export const alt = 'Website Unblocker - Check & Unblock Any Website Free'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))' }}
          >
            <path
              d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
              fill="url(#shield-gradient)"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="shield-gradient" x1="4" y1="2" x2="20" y2="20">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            Website Unblocker
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#94a3b8',
              margin: 0,
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Check & Unblock Any Website Free
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 48,
          }}
        >
          {['Instant Check', 'VPN Solutions', '100% Free'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span style={{ color: '#e2e8f0', fontSize: 20 }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#64748b', fontSize: 18 }}>websiteunblocker.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
