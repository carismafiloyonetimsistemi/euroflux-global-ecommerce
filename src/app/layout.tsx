import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ADEN | Dünyadan Güzellik Keşifleri & Advent Takvimleri",
  description:
    "ADEN ile Armani Advent Calendar, Space NK, Charlotte Tilbury, Rhode, Patrick Ta ve dünyaca ünlü kozmetik markaları güvenli ödeme ve şeffaf kargo takibiyle kapınızda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${dmSans.variable} h-full antialiased`}>
      <body
        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        className="min-h-full flex flex-col bg-white text-[#563C49]"
      >
        {children}
      </body>
    </html>
  );
}
