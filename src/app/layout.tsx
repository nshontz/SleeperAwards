import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bine to Shrine Fantasy League - Awards',
  description: 'Hop-themed fantasy football awards leaderboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <HamburgerMenu />
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}