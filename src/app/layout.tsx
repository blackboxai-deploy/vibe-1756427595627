import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Space Defender - 3D Space Combat Game',
  description: 'An immersive 3D space shooter game built with Three.js and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black overflow-hidden">
        {children}
      </body>
    </html>
  );
}