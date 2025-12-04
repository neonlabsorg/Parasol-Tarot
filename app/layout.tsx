import type { Metadata } from 'next';
import './globals.css';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Parasol Tarot';

export const metadata: Metadata = {
  title: brandName,
  description: `Discover your Parasol tarot card! Get your custom ${brandName} tarot card image.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

