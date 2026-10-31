import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'LUPITA SHOPEE | Seu universo gamer', description: 'Itens, skins, moedas e vantagens premium para elevar sua experiência no jogo.', generator: 'LUPITA SHOPEE' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#09070b', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
