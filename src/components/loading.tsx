import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
  fullScreen?: boolean
}

export function Loading({ text = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className || 'h-4 w-4'}`} />
}
