"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MatchForm } from "@/components/MatchForm";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { isLoggedIn } from "@/lib/selectors";

export default function CreatePage() {
  const router = useRouter();
  const { state } = useStoreReady();
  const { createMatch } = useActions();

  if (!isLoggedIn(state)) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Krijo termin</h1>
        <p className="text-sm text-ink-soft">
          Së pari hyr si organizator.
        </p>
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
      <MatchForm
        submitLabel="Krijo dhe hap linkun"
        onSubmit={(draft) => {
          const result = createMatch(draft) as { match: { code: string } };
          router.push(`/t/${result.match.code}`);
        }}
      />
    </div>
  );
}
