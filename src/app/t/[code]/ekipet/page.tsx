"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bench, Pitch } from "@/components/Pitch";
import { PlayerPickerSheet } from "@/components/PlayerPickerSheet";
import { PlayerRow } from "@/components/PlayerRow";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { inPlayers, missingLabel } from "@/lib/capacity";
import { roleLabel, slotsFor } from "@/lib/formations";
import { averageRating, formatRating, teamRating } from "@/lib/ratings";
import { isOrganizer, matchByCode, playersOf } from "@/lib/selectors";
import { BallMark, TeamName } from "@/components/BallMark";
import { teamKitLabel } from "@/lib/kits";
import { sidePlayers } from "@/lib/teams";
import type { MatchPlayer, TeamSide } from "@/lib/types";

export default function TeamsPage() {
  const { code } = useParams<{ code: string }>();
  const { state } = useStoreReady();
  const actions = useActions();
  const match = matchByCode(state, code);
  const [selected, setSelected] = useState<string | null>(null);
  const [captainTurn, setCaptainTurn] = useState<"A" | "B" | null>(null);
  const [picking, setPicking] = useState<{
    team: "A" | "B";
    slotIndex: number;
  } | null>(null);

  const players = match ? playersOf(state, match.id) : [];
  const ins = inPlayers(players);
  const org = match ? isOrganizer(state, match) : false;
  const missing = match ? missingLabel(match, players) : null;

  const groups = useMemo(() => {
    return {
      A: sidePlayers(players, "A"),
      B: sidePlayers(players, "B"),
      benchA: sidePlayers(players, "bench_a"),
      benchB: sidePlayers(players, "bench_b"),
      pool: sidePlayers(players, "unassigned"),
    };
  }, [players]);

  if (!match) {
    return <p className="text-sm text-ink-soft">Termini nuk u gjet.</p>;
  }

  function place(team: TeamSide, slotIndex: number | null = null) {
    if (!selected || !org) return;
    actions.assignPlayer(match!.id, selected, team, slotIndex);
    if (captainTurn) setCaptainTurn(captainTurn === "A" ? "B" : "A");
    setSelected(null);
  }

  function onSelectPlayer(id: string) {
    if (!org) return;
    if (captainTurn) {
      actions.assignPlayer(match!.id, id, captainTurn);
      setCaptainTurn(captainTurn === "A" ? "B" : "A");
      return;
    }
    setSelected((cur) => (cur === id ? null : id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/t/${match.code}`} className="text-sm font-semibold text-pitch-800">
            ← Termin
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Ekipet</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#3d5248]">
            <TeamName team="A" />
            <TeamName team="B" />
          </p>
          {missing ? (
            <p className="mt-1 text-sm font-medium text-amber-800">{missing}</p>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">Lista është plot.</p>
          )}
          {!org ? (
            <p className="mt-2 text-sm text-ink-soft">
              Vetëm organizatori i ndan ekipet, kapitënët dhe formacionin.
            </p>
          ) : null}
        </div>
      </div>

      {org ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setCaptainTurn(null);
              actions.divideTeams(match.id, "rating");
            }}
          >
            Sipas rating
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setCaptainTurn(null);
              actions.divideTeams(match.id, "random");
            }}
          >
            Random
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setCaptainTurn(null);
              actions.divideTeams(match.id, "shuffle");
            }}
          >
            Përziej
          </Button>
          <Button
            variant={captainTurn ? "primary" : "secondary"}
            onClick={() => {
              actions.resetTeams(match.id);
              setCaptainTurn("A");
              setSelected(null);
            }}
          >
            Kapitënë
          </Button>
        </div>
      ) : null}

      {captainTurn ? (
        <Card className="p-3 text-sm font-medium text-ink">
          <span className="inline-flex items-center gap-2">
            Zgjedh për <TeamName team={captainTurn} />
          </span>
          . Shtyp një lojtar nga pool-i.
        </Card>
      ) : null}

      {org && selected ? (
        <div className="grid grid-cols-4 gap-2">
          {(["A", "B", "bench_a", "bench_b"] as const).map((side) => (
            <Button key={side} size="sm" variant="soft" onClick={() => place(side)}>
              <span className="inline-flex items-center gap-1">
                <BallMark
                  kit={side === "A" || side === "bench_a" ? "white" : "black"}
                  className="h-4 w-4"
                />
                {side === "A"
                  ? "Bardhë"
                  : side === "B"
                    ? "Zezë"
                    : side === "bench_a"
                      ? "Stoli"
                      : "Stoli"}
              </span>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TeamCol
          team="A"
          kit="white"
          players={groups.A}
          ratings={state.ratings}
          selected={selected}
          onSelect={onSelectPlayer}
        />
        <TeamCol
          team="B"
          kit="black"
          players={groups.B}
          ratings={state.ratings}
          selected={selected}
          onSelect={onSelectPlayer}
        />
      </div>

      {groups.pool.length > 0 ? (
        <section>
          <SectionTitle title="Pa ekip" />
          <Card className="divide-y divide-line">
            {groups.pool.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                rating={averageRating(p.personId, state.ratings)}
                selected={selected === p.id}
                onClick={() => onSelectPlayer(p.id)}
              />
            ))}
          </Card>
        </section>
      ) : null}

      <Pitch
        formation={match.formationA}
        fieldType={match.fieldType}
        players={groups.A}
        team="A"
        editable={org}
        onChangeFormation={(id) => actions.setFormation(match.id, "A", id)}
        onSelectSlot={(slot) => setPicking({ team: "A", slotIndex: slot })}
      />
      <Bench
        title="Stoli"
        kit="white"
        team="A"
        players={groups.benchA}
        onSelect={onSelectPlayer}
      />
      <Pitch
        formation={match.formationB}
        fieldType={match.fieldType}
        players={groups.B}
        team="B"
        editable={org}
        onChangeFormation={(id) => actions.setFormation(match.id, "B", id)}
        onSelectSlot={(slot) => setPicking({ team: "B", slotIndex: slot })}
      />
      <Bench
        title="Stoli"
        kit="black"
        team="B"
        players={groups.benchB}
        onSelect={onSelectPlayer}
      />

      {picking && org ? (
        <PlayerPickerSheet
          title={`${roleLabel(
            (slotsFor(picking.team === "A" ? match.formationA : match.formationB).find(
              (s) => s.index === picking.slotIndex,
            )?.role ?? "MID"),
          )} · ${teamKitLabel(picking.team)}`}
          players={ins}
          ratings={state.ratings}
          currentId={
            (picking.team === "A" ? groups.A : groups.B).find(
              (p) => p.slotIndex === picking.slotIndex,
            )?.id
          }
          onPick={(id) => {
            actions.assignPlayer(match.id, id, picking.team, picking.slotIndex);
            setPicking(null);
            setSelected(null);
          }}
          onClear={() => {
            const occupant = (picking.team === "A" ? groups.A : groups.B).find(
              (p) => p.slotIndex === picking.slotIndex,
            );
            if (occupant) {
              actions.assignPlayer(match.id, occupant.id, picking.team, null);
            }
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}

      {org && ins.length > 0 ? (
        <Button variant="ghost" block onClick={() => actions.resetTeams(match.id)}>
          Pastro ekipet
        </Button>
      ) : null}
    </div>
  );
}

function TeamCol({
  team,
  kit,
  players,
  ratings,
  selected,
  onSelect,
}: {
  team: "A" | "B";
  kit: "white" | "black";
  players: MatchPlayer[];
  ratings: { raterKey: string; rateeId: string; score: number }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const avg = players.length ? teamRating(players, ratings) : 0;
  return (
    <Card className="overflow-hidden">
      <div
        className={
          kit === "white"
            ? "flex items-center justify-between bg-white px-3.5 py-3"
            : "flex items-center justify-between bg-[#111] px-3.5 py-3 text-white"
        }
      >
        <TeamName team={team} className={kit === "black" ? "text-white" : "text-ink"} />
        <p className={kit === "white" ? "text-xs text-[#5a6b62]" : "text-xs text-white/70"}>
          {players.length} · {players.length ? formatRating(avg) : "—"}
        </p>
      </div>
      <div className="divide-y divide-line">
        {players.length === 0 ? (
          <p className="px-3.5 pb-3 text-sm text-ink-mute">Bosh</p>
        ) : (
          players.map((p) => (
            <PlayerRow
              key={p.id}
              player={p}
              rating={averageRating(p.personId, ratings)}
              kit={kit}
              selected={selected === p.id}
              onClick={() => onSelect(p.id)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
