import type { Metadata } from "next";
import { Inter, Merriweather, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

const notoSansKr = Noto_Sans_KR({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

const notoSerifKr = Noto_Serif_KR({
  weight: ["200", "300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "CoMuse",
  description: "Collaborative content creation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} ${notoSansKr.variable} ${notoSerifKr.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Providers>
          <div className="hidden md:block">
            <Navbar />
          </div>
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
