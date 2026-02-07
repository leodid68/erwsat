import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { CosmicBackground } from '@/components/ui/CosmicBackground';
import { DictionaryPopup } from '@/components/dictionary/DictionaryPopup';
import { AuthProvider, AuthBanner, SyncProvider } from '@/components/auth';
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'SAT ERW Prep',
  description:
    'Entraînement SAT Evidence-Based Reading and Writing avec questions générées par IA',
  manifest: '/manifest.json',
  themeColor: '#8B5CF6',
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
    <html lang="fr">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <SyncProvider>
            {/* Animated cosmic background with mesh gradients */}
            <CosmicBackground />

            <TopNavbar />
            <main className="pt-16 min-h-screen relative">
              <AuthBanner />
              <div className="p-8 max-w-5xl mx-auto">
                {children}
              </div>
            </main>

            {/* Dictionary popup - appears when selecting text */}
            <DictionaryPopup />

            {/* Global keyboard shortcuts (press ? for help) */}
            <KeyboardShortcuts />

            {/* Toast notifications */}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'rgba(26, 22, 37, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FAFAFA',
                },
              }}
            />
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
