import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
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
  title: "RapiMoni",
  description: "Empowering Purchases, Empowering You!",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
  return (
    // ✨ Add `className="dark"` here to activate Tailwind dark-mode 
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}