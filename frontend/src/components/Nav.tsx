"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "대시보드" },
  { href: "/schedule", label: "일정 관리" },
  { href: "/trip", label: "출장 플래너" },
  { href: "/admin", label: "관리자" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
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
  );
}
