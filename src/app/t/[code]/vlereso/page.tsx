"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RatingList } from "@/components/RatingList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { formatWhenLong } from "@/lib/format";
import { raterKey } from "@/lib/id";
import { canRateMatch, ratingOpensAt } from "@/lib/ratings";
import { matchByCode, myMatchPlayer, playersOf } from "@/lib/selectors";

export default function RatePage() {
  const { code } = useParams<{ code: string }>();
  const { state } = useStoreReady();
  const { ratePerson, rememberIdentity } = useActions();
  const match = matchByCode(state, code);
  const players = match
    ? playersOf(state, match.id).filter((p) => p.status === "in")
    : [];
  const people = state.people.filter((p) =>
    players.some((mp) => mp.personId === p.id),
  );
  const mine = match ? myMatchPlayer(state, match.id) : undefined;
  const selfId = mine?.personId ?? state.identity?.personId;
  const key = raterKey({
    organizerId: state.organizer?.id,
    deviceKey: state.identity?.deviceKey,
  });
  const [now, setNow] = useState(() => Date.now());
  const [claim, setClaim] = useState(state.identity?.name ?? "");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  if (!match) return <p className="text-sm text-ink-soft">Termini nuk u gjet.</p>;

  const openAt = ratingOpensAt(match.startsAt);
  const open = canRateMatch(match.startsAt, now);
  const iPlayed = Boolean(
    selfId && players.some((p) => p.personId === selfId),
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/t/${match.code}`} className="text-sm font-semibold text-pitch-800">
          ← Termin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vlerëso</h1>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          1 orë pas lojës, secili lojtar i jep notë 1–10 të tjerëve, jo vetes.
          Nota ruhet dhe përdoret për ekipet.
        </p>
      </div>

      {!open ? (
        <Card className="p-4 text-sm leading-6 text-ink-soft">
          Vlerësimi hapet 1 orë pas fillimit:{" "}
          <span className="font-semibold text-ink">
            {formatWhenLong(new Date(openAt).toISOString())}
          </span>
          .
        </Card>
      ) : !iPlayed ? (
        <Card className="p-4 space-y-3">
          <p className="text-sm leading-6 text-ink-soft">
            Shkruaj emrin që ke në listë (ose bëj In te termini), pastaj vlerëso
            të tjerët.
          </p>
          {state.identity && !iPlayed ? (
            <p className="text-sm font-medium text-amber-800">
              Ky emër s’është In në këtë termin.
            </p>
          ) : null}
          <Field label="Emri">
            <Input
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Samir"
            />
          </Field>
          <Button
            block
            disabled={!claim.trim()}
            onClick={() => rememberIdentity({ name: claim, isGk: false })}
          >
            Jam unë
          </Button>
        </Card>
      ) : (
        <RatingList
          people={people}
          ratings={state.ratings}
          raterKey={key}
          selfPersonId={selfId}
          matchId={match.id}
          onRate={(personId, score) => ratePerson(personId, score, match.id)}
        />
      )}
    </div>
  );
}
