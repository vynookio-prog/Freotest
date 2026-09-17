import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'FREONIX - Pre-Order & Sajian Kuliner Khas Filipina',
  description: 'FREONIX - Etalase resmi dan sajian kuliner khas Filipina hasil proyek kokurikuler kelas XII-F1 Sains.',
  icons: {
    icon: 'https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#F7F5F0] text-[#1F2937] font-sans antialiased selection:bg-[#DDA15E] selection:text-white relative" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
