import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { InstallApp } from '@/components/install-app'

export const metadata: Metadata = { title: 'LUPITA SHOPEE | Seu universo gamer', description: 'Itens, skins, moedas e vantagens premium para elevar sua experiência no jogo.', generator: 'LUPITA SHOPEE' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#09070b', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="antialiased">{children}<div className="fixed bottom-4 right-4 z-50 max-w-[260px] rounded-xl border border-fuchsia-400/30 bg-[#100c16]/95 p-3 shadow-2xl backdrop-blur"><InstallApp /></div>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
