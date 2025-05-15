import type { Metadata } from 'next';
import './globals.css';
import AuthWrapper from '@/context/AuthWrapper';
import ScrollButtonWrapper from '@/components/ScrollButtonWrapper';
import { ThemeProvider } from '@/context/ThemeProvider';

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
    <html lang="en" className="h-full">
      <body className="h-full">
        <ThemeProvider>
          <AuthWrapper>
            {children}
            <ScrollButtonWrapper />
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
} 