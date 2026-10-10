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
            <span className="grid h-9 w-9 place-items-center" aria-hidden>
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

      <nav className="fixed inset-x-0 bottom-0 z-20 bg-[#0d5a34] pb-[env(safe-area-inset-bottom)]">
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
                  "flex h-14 items-center justify-center text-sm font-semibold !text-white",
                  active ? "opacity-100" : "opacity-60",
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
    <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden>
      <defs>
        <radialGradient id="termin-ball" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f4f1ea" />
          <stop offset="100%" stopColor="#cfc8ba" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="#0d5a34" />
      <circle cx="32" cy="32" r="26" fill="url(#termin-ball)" />
      <path
        fill="#14241c"
        d="M32 18.2 39.1 23.4 36.4 32.2h-8.8l-2.7-8.8Z"
      />
      <path
        fill="none"
        stroke="#14241c"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M32 18.2 39.1 23.4l9.2-1.4M24.9 23.4 15.7 22M36.4 32.2l4.1 8.6 9.2 1.2M27.6 32.2l-4.1 8.6-9.2 1.2M29.2 40.8h5.6L38 51.2M26 51.2 29.2 40.8M15.7 22l5.2 10.2M48.3 22 43.1 32.2M32 6.4v11.8M10.6 48.6l8.6-6.6M53.4 48.6l-8.6-6.6"
      />
    </svg>
  );
}
