"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/Market-Overview", label: "Market overview", icon: "📈" },
  { href: "/dashboard", label: "Job listings", icon: "🔍" },
  { href: "/me", label: "Me", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-h-screen bg-surface border-r border-line flex flex-col fixed top-0 left-0 z-30">
      <div className="px-[18px] py-5 border-b border-line">
        <div className="font-bold text-[17px] text-accent tracking-tight">JobRader</div>
        <div className="text-[11px] text-muted mt-[1px]">Job market insights</div>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm ${
                isActive
                  ? "bg-accent-soft text-accent font-medium"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-line">
        <Link
          href="/login"
          className={`flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm ${
            pathname === "/login"
              ? "bg-accent-soft text-accent font-medium"
              : "text-muted hover:bg-surface-2 hover:text-text"
          }`}
        >
          <span className="text-base w-5 text-center">→</span> Login / Register
        </Link>
        <button className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text w-full text-left">
          <span className="text-base w-5 text-center">↩</span> Log off
        </button>
      </div>
    </aside>
  );
}
