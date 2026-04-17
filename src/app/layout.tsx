import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'TrackMacros',
  description: 'Nutrition Tracker – Mobile First',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-zinc-950 text-white antialiased font-sans">
        <main className="min-h-screen pb-20 max-w-md mx-auto px-4 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
