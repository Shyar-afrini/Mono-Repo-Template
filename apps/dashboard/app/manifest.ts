import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Urban City Management',
        short_name: 'Urban City',
        description: 'Urban City Management System',
        start_url: '/',
        display: 'fullscreen',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon-192x192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/icon-512x512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    }
}
