// @ts-ignore: CSS module type declarations missing
//import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inquiry Agent Platform',
  description: 'HR / IT / Logistics AI assistant platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
