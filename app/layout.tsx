import type { Metadata } from "next";
import { Space_Grotesk, DM_Serif_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const dmSerif = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-dm-serif" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Hotel Maly | Operação IA",
  description: "Dashboard Analítico de Automação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${dmSerif.variable} ${spaceMono.variable}`}>
      <body className="bg-[#111111] text-[#E8E4DD] antialiased">
        {/* Filtro de Ruído Global (Noise) */}
        <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        {children}
      </body>
    </html>
  );
}