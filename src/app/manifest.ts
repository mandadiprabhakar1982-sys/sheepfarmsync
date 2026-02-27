
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SheepSync Pro',
    short_name: 'SheepSync',
    description: 'Precision management for modern shepherds',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a3622',
    theme_color: '#0a3622',
    icons: [
      {
        src: 'https://picsum.photos/seed/sheep1/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/sheep2/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
