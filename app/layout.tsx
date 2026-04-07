import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: "Grayson's Workouts",
  description: 'Soccer workout tracker for Grayson LaPorte',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Max width constrains layout to phone-width on desktop */}
        <div className="max-w-md mx-auto min-h-screen relative">
          <main className="pb-24 px-4">{children}</main>
          <Navigation />
        </div>
      </body>
    </html>
  );
}
