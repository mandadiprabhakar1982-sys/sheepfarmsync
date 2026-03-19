import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AuthGuard from '@/components/AuthGuard';
import { FarmProvider } from '@/context/FarmContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const metadata: Metadata = {
  title: 'SheepSync Pro',
  description: 'Precision management for modern shepherds',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SheepSync Pro',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#005f4b', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appleIcon = PlaceHolderImages.find(img => img.id === 'app-icon-512')?.imageUrl || 'https://picsum.photos/seed/sheep2/512/512';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href={appleIcon} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased selection:bg-primary selection:text-primary-foreground overflow-x-hidden min-h-screen">
        <FirebaseClientProvider>
          <AuthGuard>
            <LanguageProvider>
              <FarmProvider>
                {children}
              </FarmProvider>
            </LanguageProvider>
          </AuthGuard>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
