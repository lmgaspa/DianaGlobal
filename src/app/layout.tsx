// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diana Global",
  description: "Diana Global, a CryptoCurrency Project Exchange",
  // opcional: se você tiver /public/manifest.webmanifest
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  // NÃO precisa declarar icons: o Next pega automaticamente de src/app/favicon.ico
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Head é gerado automaticamente pela Metadata API + favicon do app/ */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
