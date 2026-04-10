"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "대시보드", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" },
  { href: "/schedule", label: "일정", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/trip", label: "출장", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/admin", label: "관리자", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 데스크톱 네비게이션 */}
      <nav className="hidden md:flex gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              pathname === l.href ? "bg-white/20 font-semibold" : "hover:bg-white/15"
            } ${l.href === "/admin" ? "border border-white/40" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 rounded-lg hover:bg-white/15 transition"
        aria-label="메뉴"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg z-50 border-t border-white/10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm transition ${
                pathname === l.href ? "bg-white/15 font-semibold" : "hover:bg-white/10"
              }`}
            >
              <NavIcon d={l.icon} />
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex safe-bottom">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center py-2 pt-2.5 text-[10px] transition ${
              pathname === l.href ? "text-indigo-500 font-semibold" : "text-gray-400"
            }`}
          >
            <NavIcon d={l.icon} />
            <span className="mt-0.5">{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
