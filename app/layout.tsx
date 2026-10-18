import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maison Noir — Fragrance as Memory',
  description: 'Considered fragrances, composed by hand in Grasse. A study in memory, material and the quiet art of scent.',
  applicationName: 'Maison Noir',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
