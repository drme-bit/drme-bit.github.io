import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { SettingsProvider } from '@/app/providers/ThemeProvider';
import { TerrainProvider } from '@/app/providers/TerrainProvider';
import { ModalProvider } from '@/app/providers/ModalProvider';
import { ActivityProvider } from '@/app/providers/ActivityProvider';
import { NavProvider } from '@/app/providers/NavProvider';
import Navbar from '@/widgets/navbar/Navbar';
import { SmoothScrolling } from '@/widgets/smooth-scrolling/SmoothScrolling';
import Mascot from '@/widgets/mascot/Mascot'
import { LoadingCurtain } from '@/features/loading';
import { PageTransitionProvider, TransitionLayer } from '@/features/transitions';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './globals.scss';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Dr.ME — Full-Stack Developer Portfolio',
  description:
    'Terminal-inspired portfolio of Dr.ME — full-stack developer specializing in React, Three.js, and modern web technologies.',
  keywords: ['portfolio', 'developer', 'React', 'Three.js', 'full-stack', 'web development'],
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
  metadataBase: new URL('https://drme-bit.github.io'),
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: 'var(--font-sans)' }}
        suppressHydrationWarning
      >
        <SettingsProvider>
          <TerrainProvider>
            <ModalProvider>
              <ActivityProvider>
                <NavProvider>
                  <PageTransitionProvider>
                    <LoadingCurtain />
                    <TransitionLayer />
                    <Navbar />
                    <Analytics />
                    <SpeedInsights />
                    <SmoothScrolling>
                      {children}
                    </SmoothScrolling>
                    <Mascot />
                  </PageTransitionProvider>
                </NavProvider>
              </ActivityProvider>
            </ModalProvider>
          </TerrainProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
