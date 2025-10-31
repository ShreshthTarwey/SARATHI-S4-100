import type React from "react";
import type { Metadata } from "next";
import { Fredoka as Fredoka_One, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Navigation from "@/components/navigation";
import TawkWidget from "@/components/website-widgets";
import GlobalTTSAnnouncer from "@/components/global-tts-announcer";
import "./globals.css";

// 1. ADDED: Import your voice control components
import { VoiceControlProvider } from "@/context/VoiceControlContext";
import GlobalVoiceControl from "@/components/GlobalVoiceControl";

// 2. ADDED: Import authentication provider
import { AuthProvider } from "@/context/AuthContext";

const fredokaOne = Fredoka_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SARATHI - Inclusive Learning Platform",
  description:
    "A vibrant, playful platform for inclusive communication and learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side route protection handled by Next middleware
  return (
    <html lang="en">
      <Script id="equalweb-config" strategy="beforeInteractive">
        {`window.interdeal = {
  get sitekey (){ return "83bae88ac42e5ead2a53c015efa2c042"} ,
  get domains(){
    return {
      "js": "https://cdn.equalweb.com/",
      "acc": "https://access.equalweb.com/"
    }
  },
  "Position": "left",
  "Menulang": "EN",
  "draggable": true,
  "btnStyle": {
    "vPosition": [
      "80%",
      "80%"
    ],
    "margin": [
      "0",
      "0"
    ],
    "scale": [
      "0.5",
      "0.5"
    ],
    "color": {
      "main": "#0a51f2",
      "second": "#ffffff"
    },
    "icon": {
      "outline": true,
      "outlineColor": "#ffffff",
      "type":  11 ,
      "shape": "circle"
    }
  },
                                  
};`}
      </Script>
      <Script
        id="sienna-accessibility"
        src="https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js"
        strategy="afterInteractive"
        defer
      />
      <body
        className={`font-sans ${fredokaOne.variable} ${poppins.variable} antialiased`}
      >
        {/* 3. WRAPPED: The AuthProvider wraps the entire application */}
        <AuthProvider>
          {/* 2. WRAPPED: The VoiceControlProvider now wraps the main application content */}
          <VoiceControlProvider>
            {/* Your team's existing code is untouched inside the provider */}
            <Navigation />
            <GlobalTTSAnnouncer />
            <main className="pt-16 relative z-0">
              <Suspense fallback={null}>{children}</Suspense>
            </main>

            {/* 3. ADDED: The floating microphone button, which will appear on all pages */}
            <GlobalVoiceControl />
          </VoiceControlProvider>
        </AuthProvider>

        {/* These components are outside the providers, which is perfectly fine */}
        <Analytics />
        <TawkWidget />
      </body>
    </html>
  );
} // <-- THIS IS THE MISSING CLOSING BRACE
