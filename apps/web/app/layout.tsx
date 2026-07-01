import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAiButton from "@/components/FloatingAiButton";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookFit - AI 독서 큐레이터 | 교보문고",
  description:
    "상황을 말하면 딱 맞는 책을 추천받으세요. AI가 당신의 상황을 분석해 근거 있는 도서 추천을 제공합니다.",
  keywords: ["도서 추천", "AI", "교보문고", "독서", "큐레이터", "BookFit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingAiButton />
      </body>
    </html>
  );
}
