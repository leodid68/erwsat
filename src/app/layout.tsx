import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { CosmicBackground } from '@/components/ui/CosmicBackground';
import { DictionaryPopup } from '@/components/dictionary/DictionaryPopup';

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
        {/* Animated cosmic background with mesh gradients */}
        <CosmicBackground />

        <Sidebar />
        <main className="pl-72 min-h-screen relative">
          <div className="p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        {/* Dictionary popup - appears when selecting text */}
        <DictionaryPopup />
      </body>
    </html>
  );
}
