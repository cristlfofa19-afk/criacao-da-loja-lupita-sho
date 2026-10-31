import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LUPITA SHOPEE',
    short_name: 'LUPITA',
    description: 'Sua loja gamer, agora no celular.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07050b',
    theme_color: '#09070b',
    lang: 'pt-BR',
    icons: [
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  }
}
