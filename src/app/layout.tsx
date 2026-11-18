import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ADEN | Paris & Londra Niş Güzellik Butiği",
  description:
    "ADEN ile Armani Advent Calendar, Space NK, Charlotte Tilbury, Rhode, Patrick Ta ve dünyaca ünlü kozmetik markaları güvenli ödeme ve şeffaf kargo takibiyle kapınızda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
        className="min-h-full flex flex-col bg-[#FFF9FA] text-[#3B1E28]"
      >
        {children}
      </body>
    </html>
  );
}
