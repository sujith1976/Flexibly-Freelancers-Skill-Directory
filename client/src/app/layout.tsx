import type { Metadata } from 'next';
import './globals.css';
import AuthWrapper from '@/context/AuthWrapper';
import ScrollButtonWrapper from '@/components/ScrollButtonWrapper';

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
          <ScrollButtonWrapper />
        </AuthWrapper>
      </body>
    </html>
  );
} 