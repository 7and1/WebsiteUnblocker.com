'use client'

import { Users, CheckCircle, Star } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}

const stats: StatItem[] = [
  {
    icon: <Users className="h-6 w-6" />,
    value: '2.5M+',
    label: 'Monthly Users',
    color: 'text-blue-500',
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    value: '99.2%',
    label: 'Success Rate',
    color: 'text-green-500',
  },
  {
    icon: <Star className="h-6 w-6" />,
    value: '4.8/5',
    label: 'User Rating',
    color: 'text-yellow-500',
  },
]

export function SocialProof() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
            Trusted by millions worldwide
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`mb-3 rounded-full bg-slate-100 p-3 ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">4.8 out of 5</span> based on{' '}
              <span className="font-semibold">12,847 reviews</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
