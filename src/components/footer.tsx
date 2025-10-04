import { appConfig } from '@/config/app'

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          {appConfig.footer.showTechStack && (
            <p>
              Built with{' '}
              <a
                href="https://vitejs.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Vite
              </a>
              {', '}
              <a
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                React
              </a>
              {', '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Supabase
              </a>
              {' & '}
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                n8n
              </a>
            </p>
          )}
          <p>{appConfig.footer.text}</p>
        </div>
      </div>
    </footer>
  )
}
