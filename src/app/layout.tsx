import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { CosmicBackground } from '@/components/ui/CosmicBackground';
import { DictionaryPopup } from '@/components/dictionary/DictionaryPopup';
import { AuthProvider, AuthBanner, SyncProvider } from '@/components/auth';

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'SAT ERW Prep',
  description:
    'Entraînement SAT Evidence-Based Reading and Writing avec questions générées par IA',
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SAT ERW',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <SyncProvider>
            {/* Animated cosmic background with mesh gradients */}
            <CosmicBackground />

            <Sidebar />
            <main className="pl-72 min-h-screen relative">
              <AuthBanner />
              <div className="p-8 max-w-5xl mx-auto">
                {children}
              </div>
            </main>

            {/* Dictionary popup - appears when selecting text */}
            <DictionaryPopup />
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
