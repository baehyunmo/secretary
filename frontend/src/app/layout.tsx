import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "비서 - 임원 일정 관리",
  description: "임원 일정 관리 비서 웹서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen pb-16 md:pb-0">
        <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white sticky top-0 z-40 relative">
          <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold">My Secretary</h1>
              <p className="text-white/70 text-xs md:text-sm">임원 일정 관리</p>
            </div>
            <Nav />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
