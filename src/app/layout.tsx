import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EUROFLUX Global | Avrupa & Amerika Orijinal Niş Kozmetik ve Şeffaf Kargo Üssü",
  description:
    "Sephora Paris, Space NK London ve KaDeWe Berlin çıkışlı, %100 gümrük vergisi garantili (ETGB/DDP), canlı uçuş ve batch kodu takipli yeni nesil e-ticaret platformu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
