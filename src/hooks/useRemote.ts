"use client";

import { useEffect, useState } from "react";
import {
  mergePulled,
  pullMatch,
  pullOrganizerMatches,
  subscribeMatch,
} from "@/lib/remote";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase";
import { store } from "@/lib/store";

export function useSupabaseAuth(): void {
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    const apply = (user: { id: string; email?: string | null } | null) => {
      store.update((s) => {
        if (!user) {
          if (!s.organizer?.supabaseUserId) return s;
          return { ...s, organizer: null };
        }
        return {
          ...s,
          organizer: {
            id: user.id,
            email: user.email ?? s.organizer?.email,
            supabaseUserId: user.id,
          },
        };
      });
    };

    void sb.auth.getSession().then(({ data }) => {
      apply(data.session?.user ?? null);
    });
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
}

export function useMatchSync(code: string | undefined): { linked: boolean } {
  const linked = isSupabaseEnabled();
  useEffect(() => {
    if (!linked || !code) return;
    let alive = true;
    const load = async () => {
      const pulled = await pullMatch(code);
      if (alive && pulled) store.merge((s) => mergePulled(s, pulled));
    };
    void load();
    const unsub = subscribeMatch(code, () => {
      void load();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [code, linked]);
  return { linked };
}

export function useOrganizerSync(organizerId: string | undefined): void {
  useEffect(() => {
    if (!isSupabaseEnabled() || !organizerId) return;
    let alive = true;
    void pullOrganizerMatches(organizerId).then((matches) => {
      if (!alive || matches.length === 0) return;
      store.merge((s) => {
        const ids = new Set(matches.map((m) => m.id));
        return {
          ...s,
          matches: [
            ...s.matches.filter((m) => !ids.has(m.id)),
            ...matches,
          ],
        };
      });
    });
    return () => {
      alive = false;
    };
  }, [organizerId]);
}

export function useRemoteFlag(): boolean {
  const [on] = useState(() => isSupabaseEnabled());
  return on;
}
