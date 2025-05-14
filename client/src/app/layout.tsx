import type { Metadata } from 'next';
import './globals.css';
import AuthWrapper from '@/context/AuthWrapper';

export const metadata: Metadata = {
  title: 'Next.js MongoDB Fullstack App',
  description: 'A fullstack application using Next.js, Node.js, and MongoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
} 