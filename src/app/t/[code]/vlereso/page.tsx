"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RatingList } from "@/components/RatingList";
import { useActions, useStoreReady } from "@/hooks/useApp";
import { raterKey } from "@/lib/id";
import { matchByCode, playersOf } from "@/lib/selectors";

export default function RatePage() {
  const { code } = useParams<{ code: string }>();
  const { state } = useStoreReady();
  const { ratePerson } = useActions();
  const match = matchByCode(state, code);
  const players = match ? playersOf(state, match.id) : [];
  const people = state.people.filter((p) =>
    players.some((mp) => mp.personId === p.id && mp.status !== "removed"),
  );
  const key = raterKey({
    organizerId: state.organizer?.id,
    deviceKey: state.identity?.deviceKey,
  });

  if (!match) return <p className="text-sm text-ink-soft">Termini nuk u gjet.</p>;

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/t/${match.code}`} className="text-sm font-semibold text-pitch-800">
          ← Termin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vlerëso</h1>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Secili vlerëson të tjerët, jo veten. Nota 1–10. Mesatarja përdoret për
          ndarjen e ekipeve.
        </p>
      </div>
      <RatingList
        people={people}
        ratings={state.ratings}
        raterKey={key}
        selfPersonId={state.identity?.personId}
        onRate={ratePerson}
      />
    </div>
  );
}
