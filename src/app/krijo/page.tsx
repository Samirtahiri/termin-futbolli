"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MatchForm } from "@/components/MatchForm";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { isLoggedIn } from "@/lib/selectors";

export default function CreatePage() {
  const router = useRouter();
  const { state } = useStoreReady();
  const { createMatch } = useActions();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Kontrollo nëse ka problem me Supabase auth
  useEffect(() => {
    if (state.organizer && !state.organizer.supabaseUserId) {
      const hasSupabaseConfig = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      if (hasSupabaseConfig) {
        console.warn("Supabase is configured but user is not authenticated with Supabase");
      }
    }
  }, [state.organizer]);

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

      {error && (
        <div className="rounded-2xl bg-[#fee2e2] px-4 py-3">
          <p className="text-sm font-semibold text-[#991b1b]">Gabim</p>
          <p className="text-sm text-[#991b1b] mt-1">{error}</p>
        </div>
      )}

      {creating && (
        <div className="rounded-2xl bg-[#e5f4eb] px-4 py-3">
          <p className="text-sm font-semibold text-[#0d5a34]">Po krijohet termini...</p>
        </div>
      )}

      <MatchForm
        submitLabel="Krijo dhe hap linkun"
        onSubmit={async (draft) => {
          if (creating) return;
          
          setError(null);
          setCreating(true);

          try {
            console.log("Creating match with draft:", draft);
            console.log("Current state:", { 
              hasOrganizer: !!state.organizer, 
              organizerId: state.organizer?.id,
              supabaseUserId: state.organizer?.supabaseUserId 
            });

            const result = createMatch(draft) as { state: { matches: unknown[] }; match: { id: string; code: string } };
            
            console.log("createMatch result:", result);

            if (!result) {
              throw new Error("createMatch nuk ktheu asnjë rezultat");
            }

            if (!result.match) {
              throw new Error("createMatch nuk ktheu match");
            }

            if (!result.match.code) {
              throw new Error("Match u krijua por nuk ka kod");
            }

            console.log("Match created successfully, navigating to:", `/t/${result.match.code}`);
            
            // Prit një moment që të ruhet në localStorage
            await new Promise(resolve => setTimeout(resolve, 100));
            
            router.push(`/t/${result.match.code}`);
          } catch (err) {
            console.error("Error creating match:", err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Nuk u krijua termini: ${message}`);
            setCreating(false);
          }
        }}
      />
    </div>
  );
}
