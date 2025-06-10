import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soouqna Delivery App',
  description: 'Soouqna Delivery App',
  generator: 'Soouqna Delivery App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
