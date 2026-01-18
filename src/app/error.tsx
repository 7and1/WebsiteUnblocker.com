'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-4 text-slate-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
