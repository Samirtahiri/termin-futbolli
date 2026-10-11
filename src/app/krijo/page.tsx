"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MatchForm } from "@/components/MatchForm";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { pushNow } from "@/lib/remote";
import { store } from "@/lib/store";
import { isLoggedIn } from "@/lib/selectors";

export default function CreatePage() {
  const router = useRouter();
  const { state } = useStoreReady();
  const { createMatch } = useActions();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!isLoggedIn(state)) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Krijo termin</h1>
        <p className="text-sm text-ink-soft">Së pari hyr si organizator.</p>
        <Link href="/hyr" className="font-semibold text-pitch-800">
          Shko te Hyr
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-700">
          I ri
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Krijo termin</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Bosh. Pa emra. Pastaj e dërgon linkun.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-[#fee2e2] px-4 py-3">
          <p className="text-sm font-semibold text-[#991b1b]">Gabim</p>
          <p className="mt-1 text-sm text-[#991b1b]">{error}</p>
        </div>
      ) : null}

      <MatchForm
        submitLabel={creating ? "Duke u ruajtur…" : "Krijo dhe hap linkun"}
        disabled={creating}
        onSubmit={async (draft) => {
          if (creating) return;
          setError(null);
          setCreating(true);
          try {
            const result = createMatch(draft) as
              | { match?: { code?: string } }
              | undefined;
            const code = result?.match?.code;
            if (!code) throw new Error("Termini nuk u krijua.");
            const remoteError = await pushNow(store.get());
            if (remoteError) throw new Error(remoteError);
            router.push(`/t/${code}`);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Nuk u krijua termini.",
            );
            setCreating(false);
          }
        }}
      />
    </div>
  );
}
