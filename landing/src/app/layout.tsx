import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'InFast IT-Academy — Zamonaviy IT Kasblari Akademiyasi',
  description:
    'InFast IT-Academy — Toshkentdagi zamonaviy IT kasblarini amaliyot va tajribali mentorlar ko‘magida o‘rgatuvchi yetakchi ta’lim maskani. Frontend, Backend, Mobile, Full-Stack va AI kurslari.',
  keywords: [
    'InFast',
    'InFast IT-Academy',
    'IT kurslar',
    'Toshkent IT akademiya',
    'Frontend kurslar',
    'Backend kurslar',
    'Mobile dasturlash',
    'React Native kurslari',
    'Uzbekistan IT taʼlim',
  ],
  authors: [{ name: 'InFast IT-Academy' }],
  robots: 'index, follow',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'InFast IT-Academy — Kelajakdagi kasbingni bugundan boshla',
    description:
      'Zamonaviy IT kasblarini amaliyot va real loyihalar orqali o‘rganing. InFast IT-Academy.',
    siteName: 'InFast IT-Academy',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-[#FF6A00] selection:text-[#FFFFFF]">
        {children}
      </body>
    </html>
  );
}
