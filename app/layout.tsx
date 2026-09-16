import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Park Ryze — Peer-to-Peer Smart Parking Marketplace",
  description: "Tactical P2P parking discovery in Mumbai. Book residential stilt spots & commercial hub bays instantly with 2D architectural CAD layouts and anti-fraud digital gate passes.",
  keywords: ["parking", "p2p parking", "smart parking", "mumbai parking", "vile parle", "bandra", "gate pass"],
  authors: [{ name: "Park Ryze Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
