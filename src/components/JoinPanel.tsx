"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import type { Identity, Match, MatchPlayer } from "@/lib/types";

export function JoinPanel({
  match,
  identity,
  mine,
  onJoin,
  onOut,
  onForget,
}: {
  match: Match;
  identity: Identity | null;
  mine?: MatchPlayer;
  onJoin: (input: { name: string; isGk: boolean }) => void;
  onOut: () => void;
  onForget: () => void;
}) {
  const [name, setName] = useState(identity?.name ?? "");
  const [isGk, setIsGk] = useState(identity?.isGk ?? false);
  const closed = match.status !== "open";
  const active = mine && (mine.status === "in" || mine.status === "waitlist");

  if (closed) {
    return (
      <Card className="p-4 text-sm text-ink-soft">
        Termini është {match.status === "played" ? "luajtur" : "i mbyllur"}.
      </Card>
    );
  }

  if (active) {
    return (
      <Card className="p-4 space-y-3">
        <p className="text-sm text-ink-soft">
          Je{" "}
          <span className="font-semibold text-ink">
            {mine.status === "waitlist" ? "në pritje" : "In"}
          </span>{" "}
          si {mine.name}
          {mine.isGk ? " · GK" : ""}.
        </p>
        <Button variant="danger" block onClick={onOut}>
          Out
        </Button>
        <button
          type="button"
          onClick={onForget}
          className="w-full text-center text-xs font-medium text-ink-mute"
        >
          Nuk jam unë
        </button>
      </Card>
    );
  }

  if (identity) {
    return (
      <Card className="p-4 space-y-3">
        <Button
          size="lg"
          block
          onClick={() => onJoin({ name: identity.name, isGk: identity.isGk })}
        >
          In — {identity.name}
        </Button>
        <button
          type="button"
          onClick={onForget}
          className="w-full text-center text-xs font-medium text-ink-mute"
        >
          Nuk jam unë
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <Field label="Emri">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="p.sh. Flamur"
          autoComplete="nickname"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={isGk}
          onChange={(e) => setIsGk(e.target.checked)}
          className="h-4 w-4 accent-pitch-700"
        />
        Jam GK
      </label>
      <Button
        size="lg"
        block
        disabled={!name.trim()}
        onClick={() => onJoin({ name, isGk })}
      >
        In
      </Button>
    </Card>
  );
}
