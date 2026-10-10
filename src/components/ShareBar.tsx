"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { matchUrl, shareText, viberHref, whatsappHref } from "@/lib/share";
import type { Match } from "@/lib/types";

export function ShareBar({ match }: { match: Match }) {
  const [copied, setCopied] = useState(false);
  const text = shareText(match);

  async function copy() {
    const value = matchUrl(match.code);
    try {
      await navigator.clipboard.writeText(`${text}`);
    } catch {
      await navigator.clipboard.writeText(value);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="secondary" onClick={copy}>
        {copied ? "U kopjua" : "Kopjo"}
      </Button>
      <a href={viberHref(text)} className="contents">
        <Button variant="soft">Viber</Button>
      </a>
      <a href={whatsappHref(text)} target="_blank" rel="noreferrer" className="contents">
        <Button variant="soft">WhatsApp</Button>
      </a>
    </div>
  );
}
