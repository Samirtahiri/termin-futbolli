"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#5a6b62]">
              Bëje organizator nga lista
            </p>
            <div className="flex flex-wrap gap-2">
              {candidates.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAdd(p.id)}
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#14241c] ring-1 ring-[#cfc8ba]"
                >
                  {p.name}
                  {p.deviceKey ? "" : " · i duhet linku"}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
