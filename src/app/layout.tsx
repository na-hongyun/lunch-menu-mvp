import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";
import { GoogleMapsProvider } from "@/providers/google-maps-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-kr",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "점심 추천 · 주변 맛집",
  description:
    "아키네이터식 질문으로 취향을 모으고, Google Places로 주변 식당을 찾아 드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`dark ${notoSansKr.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>
          <GoogleMapsProvider>{children}</GoogleMapsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
