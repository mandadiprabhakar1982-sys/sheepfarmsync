import { MetadataRoute } from 'next'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export default function manifest(): MetadataRoute.Manifest {
  const icon192 = PlaceHolderImages.find(img => img.id === 'app-icon-192')?.imageUrl || 'https://picsum.photos/seed/sheep1/192/192';
  const icon512 = PlaceHolderImages.find(img => img.id === 'app-icon-512')?.imageUrl || 'https://picsum.photos/seed/sheep2/512/512';

  return {
    name: 'SheepSync Pro',
    short_name: 'SheepSync',
    description: 'Precision management for modern shepherds',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0a3622',
    icons: [
      {
        src: icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}