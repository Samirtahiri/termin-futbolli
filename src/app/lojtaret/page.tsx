"use client";

import { useState } from "react";
import { RatingList } from "@/components/RatingList";
import { Avatar } from "@/components/PlayerRow";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { raterKey } from "@/lib/id";
import { isLoggedIn } from "@/lib/selectors";
import { averageRating, formatRating } from "@/lib/ratings";
import Link from "next/link";

export default function RosterPage() {
  const { state } = useStoreReady();
  const { addRosterPlayer, removeRosterPlayer, ratePerson } = useActions();
  const [name, setName] = useState("");
  const [isGk, setIsGk] = useState(false);
  const key = raterKey({
    organizerId: state.organizer?.id,
    deviceKey: state.identity?.deviceKey,
  });

  const loggedIn = isLoggedIn(state);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-700">
          Roster
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Lojtarët</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {loggedIn
            ? "I rregullt. I shton këtu, pastaj 1 tap te termin nëse tha In vetëm në Viber."
            : "Lista e emrave. Shtimi dhe fshirja janë për organizatorin."}
        </p>
      </div>

      {loggedIn ? (
        <Card className="p-4 space-y-3">
          <Field label="Emri">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Besnik"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isGk}
              onChange={(e) => setIsGk(e.target.checked)}
              className="accent-pitch-700"
            />
            GK
          </label>
          <Button
            block
            disabled={!name.trim()}
            onClick={() => {
              addRosterPlayer({ name, isGk });
              setName("");
              setIsGk(false);
            }}
          >
            Shto te roster-i
          </Button>
        </Card>
      ) : (
        <p className="text-sm text-ink-soft">
          <Link href="/hyr" className="font-semibold text-pitch-800">
            Hyr
          </Link>{" "}
          si organizator nëse do t’i shtosh emra.
        </p>
      )}

      <section>
        <SectionTitle title={`${state.people.length} emra`} />
        <Card className="divide-y divide-line">
          {state.people.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">Ende bosh.</p>
          ) : (
            state.people.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <Avatar name={p.name} isGk={p.isGk} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-mute">
                    {p.isGk ? "GK · " : ""}
                    {formatRating(averageRating(p.id, state.ratings))}
                  </p>
                </div>
                {loggedIn ? (
                  <DeleteButton
                    label="Fshi"
                    onClick={() => removeRosterPlayer(p.id)}
                  />
                ) : null}
              </div>
            ))
          )}
        </Card>
      </section>

      <section>
        <SectionTitle title="Vlerëso" />
        <RatingList
          people={state.people}
          ratings={state.ratings}
          raterKey={key}
          selfPersonId={state.identity?.personId}
          onRate={ratePerson}
        />
      </section>
    </div>
  );
}
