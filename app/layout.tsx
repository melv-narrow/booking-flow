import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skip Hire Booking | REM Waste',
  description:
    'Book a skip online in minutes. Choose your size, waste type, and confirm your collection — all in one simple flow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
