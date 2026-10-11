"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStoreReady } from "@/hooks/useApp";
import { useRemoteFlag, useSupabaseAuth } from "@/hooks/useRemote";
import { BallMark } from "@/components/BallMark";
import { LogoutButton } from "@/components/LogoutButton";
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
            <span className="grid h-10 w-10 place-items-center" aria-hidden>
              <BallMark />
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
            {loggedIn ? (
              <LogoutButton />
            ) : (
              <Link href="/hyr" className="text-sm font-semibold text-[#0d5a34]">
                Hyr
              </Link>
            )}
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
