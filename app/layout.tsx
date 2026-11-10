import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const notoBengali = localFont({
  src: [
    {
      path: '../public/fonts/NotoSansBengali-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NotoSansBengali-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'নাগরিক সাথী এআই (Nagorik Sathi AI) — ডিজিটাল নাগরিক সেবা ও অভিযোগ ব্যবস্থাপনা প্ল্যাটফর্ম',
  description:
    'বাংলাদেশের সিটি কর্পোরেশনসমূহের জন্য বহু-বিভাগীয় নাগরিক অভিযোগ নিষ্পত্তি, এআই সেবা সহায়ক এবং তদারকি প্ল্যাটফর্ম।',
  openGraph: {
    title: 'নাগরিক সাথী এআই (Nagorik Sathi AI)',
    description:
      'বাংলাদেশের সিটি কর্পোরেশনসমূহের জন্য বহু-বিভাগীয় নাগরিক অভিযোগ নিষ্পত্তি, এআই সেবা সহায়ক এবং তদারকি প্ল্যাটফর্ম।',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'নাগরিক সাথী এআই (Nagorik Sathi AI)',
    description:
      'বাংলাদেশের সিটি কর্পোরেশনসমূহের জন্য বহু-বিভাগীয় নাগরিক অভিযোগ নিষ্পত্তি, এআই সেবা সহায়ক এবং তদারকি প্ল্যাটফর্ম।',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={notoBengali.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F8FAFC] text-[#1E293B] antialiased selection:bg-[#005b32] selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
