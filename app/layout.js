import './globals.css'
import { Toaster } from 'sonner'
import InteractionFX from '@/components/InteractionFX'
import dynamic from 'next/dynamic'
const DomainExpansion = dynamic(() => import('@/components/DomainExpansion'), { ssr: false })

export const metadata = {
  title: 'LifeOS — AI-Powered Personal Growth OS',
  description: 'Your cinematic personal analytics OS. Upload documents, get AI study plans, track every metric of your growth.',
  keywords: 'self improvement, study tracker, habit tracker, AI planner, life dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <DomainExpansion domain="gojo" />
        <InteractionFX />
        {/* Dark scrim — kills background shader bleed so UI is readable */}
        <div className="content-scrim" aria-hidden="true" />

        <div className="relative z-10">
          {children}
        </div>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'rgba(15, 12, 25, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(20px)',
              color: '#f8fafc',
            },
          }}
        />
      </body>
    </html>
  )
}
