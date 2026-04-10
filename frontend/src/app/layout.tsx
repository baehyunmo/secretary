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
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">My Secretary</h1>
              <p className="text-white/70 text-sm">임원 일정 관리 대시보드</p>
            </div>
            <Nav />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
