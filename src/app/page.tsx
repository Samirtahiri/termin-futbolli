"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { useOrganizerSync } from "@/hooks/useRemote";
import { fieldLabel, matchProgress } from "@/lib/capacity";
import { formatWhenLong } from "@/lib/format";
import { isLoggedIn, myMatches, playersOf } from "@/lib/selectors";

export default function HomePage() {
  const { state } = useStoreReady();
  const { deleteMatch } = useActions();
  const loggedIn = isLoggedIn(state);
  useOrganizerSync(state.organizer?.supabaseUserId ?? state.organizer?.id);
  const matches = myMatches(state);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-[#0d5a34] px-5 py-6 text-white shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          Futboll
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Termin</h1>
        <p className="mt-2 max-w-[20rem] text-sm leading-6 text-white/80">
          Dërgo linkun bosh. Ata bëjnë In. Ti ndan ekipet.
        </p>
        <div className="mt-5">
          <Link href={loggedIn ? "/krijo" : "/hyr"}>
            <Button
              className="!bg-white !text-[#0d5a34] hover:!bg-[#f4f1ea]"
              size="lg"
            >
              {loggedIn ? "Krijo termin" : "Hyr dhe krijo"}
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <SectionTitle kicker="Të miat" title="Terminet" />
        {matches.length === 0 ? (
          <Card className="p-6 text-sm leading-6 text-ink-soft">
            Nuk ke asnjë termin. Krijo një, kopjo linkun, dhe prit In.
          </Card>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const players = playersOf(state, match.id);
              const progress = matchProgress(match, players);
              return (
                <Card key={match.id} className="p-4">
                  <Link href={`/t/${match.code}`} className="block space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight">
                          {match.title}
                        </h3>
                        <p className="text-sm text-ink-soft">
                          {formatWhenLong(match.startsAt)}
                        </p>
                        <p className="text-sm text-ink-mute">{match.location}</p>
                      </div>
                      <Badge tone="green">{fieldLabel(match.fieldType)}</Badge>
                    </div>
                    <p className="text-xs font-medium text-ink-mute">
                      Lojtarë {progress.outfield}/{progress.needOutfield} · GK{" "}
                      {progress.gk}/{progress.needGk}
                      {progress.waitlist
                        ? ` · pritje ${progress.waitlist}`
                        : ""}
                    </p>
                  </Link>
                  <DeleteButton
                    className="mt-1"
                    label="Fshi termin"
                    onClick={() => deleteMatch(match.id)}
                  />
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
