"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { fieldLabel } from "@/lib/capacity";
import { fromLocalInputs, toLocalInputs, todayInputs } from "@/lib/format";
import { cx } from "@/lib/cx";
import type { FieldType, Match } from "@/lib/types";

export type MatchDraft = {
  title: string;
  startsAt: string;
  location: string;
  notes: string;
  fieldType: FieldType;
  benchSize: number;
};

export function MatchForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Match>;
  submitLabel: string;
  onSubmit: (draft: MatchDraft) => void;
}) {
  const seed = initial?.startsAt ? toLocalInputs(initial.startsAt) : todayInputs();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(seed.date);
  const [time, setTime] = useState(seed.time);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(initial?.fieldType ?? "small");
  const [benchSize, setBenchSize] = useState(initial?.benchSize ?? 2);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          startsAt: fromLocalInputs(date, time),
          location,
          notes,
          fieldType,
          benchSize,
        });
      }}
    >
      <Field label="Titulli">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Termin"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        <Field label="Data">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-field"
          />
        </Field>
        <Field label="Ora">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="date-field"
          />
        </Field>
      </div>
      <Field label="Fusha / vendi">
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="p.sh. Fusha te Lumi"
        />
      </Field>
      <Field label="Shënime">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opsionale"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        {(["small", "large"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFieldType(type)}
            className={cx(
              "rounded-2xl px-3 py-3 text-left ring-1 transition",
              fieldType === type
                ? "bg-pitch-50 ring-pitch-700 text-pitch-900"
                : "bg-white ring-line",
            )}
          >
            <p className="text-base font-semibold">{fieldLabel(type)}</p>
            <p className="text-xs text-ink-mute">
              {type === "small" ? "10 lojtarë + 2 GK" : "20 lojtarë + 2 GK"}
            </p>
          </button>
        ))}
      </div>
      <Field label="Rezerva për ekip" hint="Tepricat shkojnë stoli, pastaj waitlist">
        <Input
          type="number"
          min={0}
          max={6}
          value={benchSize}
          onChange={(e) => setBenchSize(Number(e.target.value))}
        />
      </Field>
      <Button type="submit" size="lg" block>
        {submitLabel}
      </Button>
    </form>
  );
}
