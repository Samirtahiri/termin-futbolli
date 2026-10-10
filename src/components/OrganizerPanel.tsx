"use client";

import { useState } from "react";
import { useClickLock } from "@/hooks/useClickLock";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Spinner } from "@/components/ui/Spinner";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cx } from "@/lib/cx";
import { organizerUrl, viberHref } from "@/lib/share";
import type { Match, MatchPlayer, Person } from "@/lib/types";

export function OrganizerPanel({
  match,
  players,
  people,
  onAdd,
  onRemove,
}: {
  match: Match;
  players: MatchPlayer[];
  people: Person[];
  onAdd: (playerId: string) => void;
  onRemove: (personId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const lock = useClickLock(1000);
  const link = organizerUrl(match.code, match.organizerToken);
  const managers = match.managerPersonIds
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is Person => Boolean(p));
  const candidates = players.filter(
    (p) =>
      (p.status === "in" || p.status === "waitlist") &&
      !match.managerPersonIds.includes(p.personId),
  );

  async function copy() {
    await navigator.clipboard.writeText(
      `Je organizator i terminit. Ekipet, kapitënët, formacioni:\n${link}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="space-y-3">
      <SectionTitle kicker="Rol" title="Organizatorët" />
      <Card className="p-4 space-y-3">
        <p className="text-sm leading-6 text-[#3d5248]">
          Shembull: ti je A, s’luan. B vetëm e shkroi emrin te In, pa login.
          Shtype B te lista — në telefonin ku B bëri In i dalin Ekipet. S’i duhet
          email.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="green">Krijuesi</Badge>
          {managers.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1">
              <Badge tone="blue">{p.name}</Badge>
              <DeleteButton
                label="Hiq"
                className="h-7 w-7"
                onClick={() => onRemove(p.id)}
              />
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={copy}>
            {copied ? "U kopjua" : "Link organizatori"}
          </Button>
          <a href={viberHref(`Je organizator i terminit:\n${link}`)} className="contents">
            <Button variant="soft">Viber</Button>
          </a>
        </div>
        {candidates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm leading-6 text-[#3d5248]">
              Shtyp një emër për ta bërë organizator në këtë termin.
            </p>
            <div className="divide-y divide-[#cfc8ba] overflow-hidden rounded-2xl ring-1 ring-[#cfc8ba]">
              {candidates.map((p) => {
                const busy = lock.busy(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={Boolean(lock.locked)}
                    onClick={() => lock.run(p.id, () => onAdd(p.id))}
                    className={cx(
                      "flex w-full items-center gap-3 px-3.5 py-3 text-left disabled:pointer-events-none",
                      busy ? "bg-[#e5f4eb]" : "bg-white",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#14241c]">{p.name}</p>
                      <p className="text-xs text-[#5a6b62]">
                        {p.status === "waitlist" ? "Në pritje" : "In"}
                        {p.isGk ? " · GK" : ""}
                        {p.deviceKey ? "" : " · i duhet linku"}
                      </p>
                    </div>
                    {busy ? (
                      <Spinner className="text-[#0d5a34]" />
                    ) : (
                      <span className="text-xs font-semibold text-[#0d5a34]">
                        Zgjidh
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
