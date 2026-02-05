import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { CosmicBackground } from '@/components/ui/CosmicBackground';
import { DictionaryPopup } from '@/components/dictionary/DictionaryPopup';
import { AuthProvider, AuthBanner, SyncProvider } from '@/components/auth';

export const metadata: Metadata = {
  title: 'SAT ERW Prep',
  description:
    'Entraînement SAT Evidence-Based Reading and Writing avec questions générées par IA',
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
