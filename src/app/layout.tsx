import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SettingsProvider } from '@/app/providers/ThemeProvider';
import { TerrainProvider } from '@/app/providers/TerrainProvider';
import { ModalProvider } from '@/app/providers/ModalProvider';
import { ActivityProvider } from '@/app/providers/ActivityProvider';
import { NavProvider } from '@/app/providers/NavProvider';
import { ChatProvider } from '@/app/providers/ChatProvider';
import { PresenceProvider, RemoteCursors } from '@/features/presence';
import Navbar from '@/widgets/navbar/Navbar';
import Mascot from '@/widgets/mascot/Mascot';
import { ContentWindow } from '@/widgets/content-window';
import Cursor from '@/shared/ui/Cursor/Cursor';
import { SmoothScrolling } from '@/widgets/smooth-scrolling/SmoothScrolling';
import { LoadingCurtain } from '@/features/loading';
import { PageTransitionProvider, TransitionLayer } from '@/features/transitions';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import 'lenis/dist/lenis.css';
import './globals.scss';

/* Geist: display + sans share the same grotesk, mono for code.
   Vercel discipline — weights 400/500/600 only, tight tracking via CSS. */
export const metadata: Metadata = {
  title: 'Dr.ME — Full-Stack Developer Portfolio',
  description:
    'Terminal-inspired portfolio of Dr.ME — full-stack developer specializing in React, Three.js, and modern web technologies.',
  keywords: ['portfolio', 'developer', 'Dr.ME', 'drme', 'drme-bit'],
  authors: [{ name: 'Dr.ME' }],
  openGraph: {
    type: 'website',
    title: 'Dr.ME — Full-Stack Developer Portfolio',
    description: 'Terminal-inspired portfolio showcasing projects, skills, and blog posts.',
    url: 'https://drme-bit.github.io',
    siteName: 'Dr.ME Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr.ME — Full-Stack Developer Portfolio',
    description: 'Terminal-inspired portfolio showcasing projects, skills, and blog posts.',
  },
  metadataBase: new URL('https://drme.me'),
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        style={{ fontFamily: 'var(--font-geist-sans)' }}
        suppressHydrationWarning
      >
        <SettingsProvider>
          <TerrainProvider>
            <ModalProvider>
              <ActivityProvider>
                <NavProvider>
                  <ChatProvider>
                  <PresenceProvider>
                  <PageTransitionProvider>
                    <ContentWindow id="main" tone="quiet">
                      <LoadingCurtain />
                      <TransitionLayer />

                      <Navbar />
                      <Analytics />
                      <SpeedInsights />
                      <SmoothScrolling>{children}</SmoothScrolling>
                    </ContentWindow>
                    <Cursor />
                    <RemoteCursors />
                    <Mascot />
                  </PageTransitionProvider>
                  </PresenceProvider>
                  </ChatProvider>
                </NavProvider>
              </ActivityProvider>
            </ModalProvider>
          </TerrainProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
