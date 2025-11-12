
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'SIGMA 10000 AURA - Sistema de Controle Logístico',
  description: 'Sistema de controle de acesso de caminhoneiros em pátios logísticos',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg'
  },
  openGraph: {
    title: 'SIGMA 10000 AURA',
    description: 'Sistema de controle de acesso de caminhoneiros em pátios logísticos',
    images: ['/og-image.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
