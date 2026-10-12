import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Quản lý chốt kỳ kế toán | Arito Group',
  description: 'Theo dõi checklist, tồn kho, giá thành, công nợ và tiến độ chốt báo cáo tài chính.',
  icons: {
    icon: '/brands/Arito_logo.webp',
    shortcut: '/brands/Arito_logo.webp',
    apple: '/brands/Arito_logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${quicksand.variable} h-full antialiased`}
      style={{ fontFamily: 'var(--font-quicksand), "Quicksand", sans-serif' }}
    >
      <body 
        suppressHydrationWarning 
        className="h-full bg-[#f0f5fc] text-slate-900 antialiased selection:bg-blue-600 selection:text-white"
        style={{ fontFamily: 'var(--font-quicksand), "Quicksand", sans-serif' }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
