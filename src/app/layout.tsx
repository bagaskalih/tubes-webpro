// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WithSubnavigation from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Online Orangtua Pintar",
  description: "Solusi Modern untuk Orang Tua Cerdas",
  keywords: ["Orangtua", "Pintar", "Portal", "Online"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <div className="relative flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <WithSubnavigation />
              </div>
            </header>
            <main className="flex-1 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
