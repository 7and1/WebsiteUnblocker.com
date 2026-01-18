import { Search } from 'lucide-react'
import { Button, Input } from '@/components/ui'

type DiagnosisInputProps = {
  url: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function DiagnosisInput({ url, loading, onChange, onSubmit }: DiagnosisInputProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="flex-1">
        <Input
          type="text"
          value={url}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSubmit()}
          placeholder="youtube.com, twitter.com..."
          aria-label="Website URL to check"
          aria-describedby="url-hint"
          role="searchbox"
          icon={<Search className="h-5 w-5" />}
        />
      </div>
      <Button
        type="button"
        onClick={onSubmit}
        loading={loading}
        disabled={!url.trim()}
        size="lg"
        aria-busy={loading}
        aria-disabled={loading || !url.trim()}
        className="w-full md:w-auto"
      >
        {loading ? 'Checking...' : 'Check'}
      </Button>
    </div>
  )
}
