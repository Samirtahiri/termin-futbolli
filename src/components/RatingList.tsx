"use client";

import { Card } from "@/components/ui/Card";
import { RatingScale } from "@/components/ui/RatingScale";
import { Avatar } from "@/components/PlayerRow";
import { averageRating, formatRating, myScore, ratingCount } from "@/lib/ratings";
import type { Person, Rating } from "@/lib/types";

export function RatingList({
  people,
  ratings,
  raterKey,
  selfPersonId,
  onRate,
}: {
  people: Person[];
  ratings: Rating[];
  raterKey: string | null;
  selfPersonId?: string;
  onRate: (personId: string, score: number) => void;
}) {
  const others = people.filter((p) => p.id !== selfPersonId);

  if (!raterKey) {
    return (
      <Card className="p-4 text-sm text-ink-soft">
        Bëj In me emrin tënd, ose hyr si organizator, pastaj vlerëso.
      </Card>
    );
  }

  if (others.length === 0) {
    return (
      <Card className="p-4 text-sm text-ink-soft">
        Nuk ka ende të tjerë për t’i vlerësuar.
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-line">
      {others.map((person) => {
        const count = ratingCount(person.id, ratings);
        const avg = averageRating(person.id, ratings);
        const mine = myScore(raterKey, person.id, ratings);
        return (
          <div key={person.id} className="p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={person.name} isGk={person.isGk} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{person.name}</p>
                <p className="text-xs text-ink-mute">
                  {count === 0
                    ? "Pa notë ende · max 10"
                    : `Mesatarja ${formatRating(avg)} / 10`}
                </p>
              </div>
            </div>
            <RatingScale
              value={mine}
              onChange={(score) => onRate(person.id, score)}
            />
          </div>
        );
      })}
    </Card>
  );
}
