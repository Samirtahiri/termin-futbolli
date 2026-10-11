import { uid } from "./id";
import { schedulePush } from "./remote";
import type { AppState, Match } from "./types";

function normalizeMatch(match: Match): Match {
  return {
    ...match,
    organizerToken: match.organizerToken || uid("ot"),
    managerPersonIds: match.managerPersonIds ?? [],
    managerDeviceKeys: match.managerDeviceKeys ?? [],
  };
}

export const STORAGE_KEY = "termin-futbolli:v1";

export function emptyState(): AppState {
  return {
    version: 1,
    organizer: null,
    identity: null,
    managedMatchIds: [],
    people: [],
    matches: [],
    matchPlayers: [],
    ratings: [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed?.version !== 1) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      managedMatchIds: parsed.managedMatchIds ?? [],
      people: parsed.people ?? [],
      matches: (parsed.matches ?? []).map(normalizeMatch),
      matchPlayers: parsed.matchPlayers ?? [],
      ratings: parsed.ratings ?? [],
    };
  } catch {
    return emptyState();
  }
}

export function persistState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Listener = () => void;

let current = emptyState();
let hydrated = false;
const listeners = new Set<Listener>();

export const store = {
  get(): AppState {
    return current;
  },
  isHydrated(): boolean {
    return hydrated;
  },
  hydrate(): void {
    current = loadState();
    hydrated = true;
    listeners.forEach((l) => l());
  },
  set(next: AppState, options?: { skipRemote?: boolean }): void {
    current = next;
    persistState(next);
    listeners.forEach((l) => l());
    if (!options?.skipRemote) schedulePush(next);
  },
  merge(recipe: (prev: AppState) => AppState): void {
    store.set(recipe(current), { skipRemote: true });
  },
  update(recipe: (prev: AppState) => AppState): void {
    store.set(recipe(current));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
