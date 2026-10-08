import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthenticationGuard from './_components/auth/AuthenticationGuard';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TMC UI',
  description: 'Open-source UI for TMs managed by a TMC instance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const serverUrl = process.env.SERVER_URL;
  const tokenUrl = process.env.TOKEN_URL;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <AuthenticationGuard serverUrl={serverUrl} tokenUrl={tokenUrl}>
          {children}
        </AuthenticationGuard>
      </body>
    </html>
  );
}
