import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { ClerkProvider } from '@clerk/nextjs'

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
        <ThemeProvider>
          <HamburgerMenu/>
          <ThemeToggle/>
          <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 items-center gap-2">
              {children}
            </div>
          </div>
        </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}