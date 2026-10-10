"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStoreReady } from "@/hooks/useApp";
import { useRemoteFlag, useSupabaseAuth } from "@/hooks/useRemote";
import { cx } from "@/lib/cx";
import { isLoggedIn } from "@/lib/selectors";

const NAV = [
  { href: "/", label: "Termine" },
  { href: "/krijo", label: "Krijo" },
  { href: "/lojtaret", label: "Lojtarët" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, state } = useStoreReady();
  const path = usePathname();
  const remote = useRemoteFlag();
  const loggedIn = isLoggedIn(state);
  useSupabaseAuth();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 border-b border-[#cfc8ba]/80 bg-[#f4f1ea]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0d5a34] text-white shadow-sm">
              <BallIcon />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[#14241c]">
              Termin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                remote
                  ? "bg-[#e5f4eb] text-[#0d5a34]"
                  : "bg-[#ece7dc] text-[#5a6b62]",
              )}
            >
              {remote ? "Online" : "Lokal"}
            </span>
            <Link
              href={loggedIn ? "/krijo" : "/hyr"}
              className="text-sm font-semibold text-[#0d5a34]"
            >
              {loggedIn ? "Organizator" : "Hyr"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        {ready ? children : <Splash />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#cfc8ba]/80 bg-[#f4f1ea]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto grid max-w-lg grid-cols-3 px-2">
          {NAV.map((item) => {
            const active = path === item.href;
            const href =
              !loggedIn && item.href === "/krijo" ? "/hyr" : item.href;
            return (
              <Link
                key={item.href}
                href={href}
                className={cx(
                  "flex h-14 items-center justify-center text-sm font-semibold",
                  active ? "text-[#0d5a34]" : "text-[#5a6b62]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Splash() {
  return (
    <div className="grid place-items-center py-24 text-ink-mute text-sm">
      Duke u ngarkuar…
    </div>
  );
}

function BallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5c2.2 2 3.4 5 3.4 8.5S14.2 18.5 12 20.5C9.8 18.5 8.6 15.5 8.6 12S9.8 5.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M4.6 9.2h14.8M4.6 14.8h14.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
