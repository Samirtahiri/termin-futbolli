"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { JoinPanel } from "@/components/JoinPanel";
import { OrganizerPanel } from "@/components/OrganizerPanel";
import { PlayerRow } from "@/components/PlayerRow";
import { ProgressStats } from "@/components/ProgressStats";
import { ShareBar } from "@/components/ShareBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { useClickLock } from "@/hooks/useClickLock";
import { fieldLabel, missingLabel, waitlistPlayers, inPlayers } from "@/lib/capacity";
import { formatWhenLong } from "@/lib/format";
import { averageRating, canRateMatch } from "@/lib/ratings";
import {
  isOrganizer,
  matchByCode,
  myMatchPlayer,
  playersOf,
} from "@/lib/selectors";
import { supabaseNote } from "@/lib/supabase";

export default function MatchPage() {
  const { code } = useParams<{ code: string }>();
  const { state } = useStoreReady();
  const actions = useActions();
  const match = matchByCode(state, code);
  const players = match ? playersOf(state, match.id) : [];
  const mine = match ? myMatchPlayer(state, match.id) : undefined;
  const org = match ? isOrganizer(state, match) : false;
  const ins = inPlayers(players);
  const waiting = waitlistPlayers(players);
  const missing = match ? missingLabel(match, players) : null;
  const [addName, setAddName] = useState("");
  const [addGk, setAddGk] = useState(false);
  const lock = useClickLock();

  useEffect(() => {
    if (!match) return;
    const token = new URLSearchParams(window.location.search).get("org");
    if (!token) return;
    actions.claimOrganizerRole(match.id, token);
    window.history.replaceState({}, "", `/t/${match.code}`);
  }, [actions, match]);

  const unusedRoster = useMemo(() => {
    if (!match) return [];
    const used = new Set(
      players
        .filter((p) => p.status === "in" || p.status === "waitlist")
        .map((p) => p.personId),
    );
    return state.people.filter((p) => !used.has(p.id));
  }, [match, players, state.people]);

  if (!match) {
    return (
      <Card className="p-6 text-sm text-ink-soft">
        Ky termin nuk u gjet në këtë telefon. Nëse e hapi dikush tjetër, duhet
        Supabase.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-700">
              {formatWhenLong(match.startsAt)}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {match.title}
            </h1>
            <p className="text-sm text-ink-soft">{match.location || "Vend i papërcaktuar"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge tone="green">{fieldLabel(match.fieldType)}</Badge>
            {org ? <Badge tone="blue">Organizator</Badge> : null}
          </div>
        </div>
        {match.notes ? (
          <p className="text-sm leading-6 text-ink-soft">{match.notes}</p>
        ) : null}
        {missing ? (
          <p className="text-sm font-medium text-amber-800">{missing}</p>
        ) : (
          <p className="text-sm font-medium text-pitch-800">Lista është plot.</p>
        )}
      </header>

      {supabaseNote(state) ? (
        <p className="rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs leading-5 text-amber-900">
          {supabaseNote(state)}
        </p>
      ) : null}

      <ProgressStats match={match} players={players} />
      <ShareBar match={match} />

      <JoinPanel
        match={match}
        identity={state.identity}
        mine={mine}
        onJoin={(input) => actions.playerJoin(match.id, input)}
        onOut={() => actions.playerOut(match.id)}
        onForget={() => actions.clearIdentity()}
      />

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/t/${match.code}/ekipet`}>
          <Button variant="secondary" block>
            Ekipet
          </Button>
        </Link>
        <Link href={`/t/${match.code}/vlereso`}>
          <Button variant="secondary" block>
            {canRateMatch(match.startsAt) ? "Vlerëso" : "Vlerëso · 1h pas"}
          </Button>
        </Link>
      </div>

      <section>
        <SectionTitle
          kicker="FIFO"
          title={`In · ${ins.length}`}
        />
        <Card className="divide-y divide-line">
          {ins.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">Askush ende. Dërgo linkun.</p>
          ) : (
            ins.map((p, i) => (
              <PlayerRow
                key={p.id}
                player={p}
                rating={averageRating(p.personId, state.ratings)}
                right={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-ink-mute">
                      #{i + 1}
                    </span>
                    {org ? (
                      <DeleteButton
                        label="Heq"
                        onClick={() => actions.organizerRemove(match.id, p.id)}
                      />
                    ) : null}
                  </div>
                }
              />
            ))
          )}
        </Card>
      </section>

      {waiting.length > 0 ? (
        <section>
          <SectionTitle title={`Pritje · ${waiting.length}`} />
          <Card className="divide-y divide-line">
            {waiting.map((p, i) => (
              <PlayerRow
                key={p.id}
                player={p}
                right={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-mute">#{i + 1}</span>
                    {org ? (
                      <DeleteButton
                        label="Heq"
                        onClick={() => actions.organizerRemove(match.id, p.id)}
                      />
                    ) : null}
                  </div>
                }
              />
            ))}
          </Card>
        </section>
      ) : null}

      {org ? (
        <OrganizerPanel
          match={match}
          players={players}
          people={state.people}
          onAdd={(playerId) => actions.addMatchManager(match.id, playerId)}
          onRemove={(personId) => actions.removeMatchManager(match.id, personId)}
        />
      ) : null}

      {org ? (
        <section className="space-y-3">
          <SectionTitle
            kicker="Backup"
            title="Shto unë"
            action={
              match.status === "open" ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-pitch-800"
                  onClick={() =>
                    actions.updateMatch(match.id, { status: "closed" })
                  }
                >
                  Mbyll In
                </button>
              ) : (
                <button
                  type="button"
                  className="text-xs font-semibold text-pitch-800"
                  onClick={() =>
                    actions.updateMatch(match.id, { status: "open" })
                  }
                >
                  Hap In
                </button>
              )
            }
          />
          <Card className="p-4 space-y-3">
            <Field label="Emër i ri">
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Samir"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={addGk}
                onChange={(e) => setAddGk(e.target.checked)}
                className="accent-pitch-700"
              />
              GK
            </label>
            <Button
              variant="secondary"
              block
              disabled={!addName.trim()}
              onClick={() => {
                actions.organizerAddPlayer(match.id, {
                  name: addName,
                  isGk: addGk,
                });
                setAddName("");
                setAddGk(false);
              }}
            >
              Shto
            </Button>
          </Card>
          {unusedRoster.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unusedRoster.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={lock.busy(p.id)}
                  onClick={() =>
                    lock.run(p.id, () =>
                      actions.organizerAddPlayer(match.id, {
                        name: p.name,
                        isGk: p.isGk,
                        personId: p.id,
                      }),
                    )
                  }
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-line disabled:opacity-50"
                >
                  {p.name}
                  {p.isGk ? " · GK" : ""}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
