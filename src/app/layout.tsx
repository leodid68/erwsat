import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

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
    <html lang="fr">
      <body className="antialiased min-h-screen">
        <Sidebar />
        <main className="pl-72 min-h-screen">
          <div className="p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
