"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase";
import { isLoggedIn } from "@/lib/selectors";

export default function LoginPage() {
  const router = useRouter();
  const { state } = useStoreReady();
  const { becomeOrganizer, logoutOrganizer } = useActions();
  const [email, setEmail] = useState(state.organizer?.email ?? "");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const remote = isSupabaseEnabled();
  const loggedIn = isLoggedIn(state);

  useEffect(() => {
    if (loggedIn) router.replace("/krijo");
  }, [loggedIn, router]);

  async function sendLink() {
    const sb = getSupabase();
    if (!sb || !email.trim()) return;
    setBusy(true);
    setInfo("");
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/hyr` },
    });
    setBusy(false);
    setInfo(
      error
        ? error.message
        : "Shiko email-in — hap linkun, pastaj je organizator në çdo telefon.",
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d5a34]">
          Organizatori
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hyr</h1>
        <p className="mt-2 text-sm leading-6 text-[#3d5248]">
          Vetëm organizatori hyn me email. Lojtarët e hapin linkun e terminit dhe
          bëjnë In pa llogari.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emri@email.com"
          />
        </Field>
        {remote ? (
          <Button size="lg" block disabled={busy || !email.trim()} onClick={sendLink}>
            {busy ? "Duke dërguar…" : "Dërgo linkun e hyrjes"}
          </Button>
        ) : (
          <Button
            size="lg"
            block
            onClick={() => {
              becomeOrganizer(email || undefined);
              router.push("/krijo");
            }}
          >
            Hyr (pa Supabase)
          </Button>
        )}
        {info ? <p className="text-sm text-[#3d5248]">{info}</p> : null}
        {loggedIn ? (
          <Button
            variant="ghost"
            block
            onClick={async () => {
              await getSupabase()?.auth.signOut();
              logoutOrganizer();
            }}
          >
            Dil
          </Button>
        ) : null}
      </Card>

      <p className="text-xs leading-5 text-[#5a6b62]">
        {remote
          ? "Pas email-it, mund të krijosh termine. Kush e ka linkun, bën In pa u kyçur."
          : "Shto env e Supabase që hyrja me email të funksionojë."}
      </p>
    </div>
  );
}
