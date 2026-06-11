import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../styles/global.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COVE — Korean-Inspired Café & Lounge, Aizawl',
  description:
    'COVE is a premium Korean-inspired café and entertainment lounge in Aizawl, Mizoram. Book private rooms, order food, and explore specialty coffee, a cat café, pool table, and photobooth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
