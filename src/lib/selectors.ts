import { inPlayers, waitlistPlayers } from "./capacity";
import { nameKey } from "./id";
import { isSupabaseEnabled } from "./supabase";
import type { AppState, Match, MatchPlayer, Person } from "./types";

export function isLoggedIn(state: AppState): boolean {
  if (isSupabaseEnabled()) return Boolean(state.organizer?.supabaseUserId);
  return Boolean(state.organizer);
}

export function matchByCode(state: AppState, code: string): Match | undefined {
  return state.matches.find((m) => m.code === code);
}

export function playersOf(state: AppState, matchId: string): MatchPlayer[] {
  return state.matchPlayers.filter((p) => p.matchId === matchId);
}

export function myMatches(state: AppState): Match[] {
  return state.matches
    .filter((m) => isOrganizer(state, m))
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
}

export function personById(state: AppState, id: string): Person | undefined {
  return state.people.find((p) => p.id === id);
}

export function findPersonByName(state: AppState, name: string): Person | undefined {
  const key = name.trim().toLocaleLowerCase("sq");
  return state.people.find((p) => p.name.toLocaleLowerCase("sq") === key);
}

export function activeOnMatch(state: AppState, matchId: string) {
  const list = playersOf(state, matchId);
  return {
    all: list,
    in: inPlayers(list),
    waitlist: waitlistPlayers(list),
  };
}

export function isOrganizer(state: AppState, match: Match): boolean {
  if (state.organizer && state.organizer.id === match.organizerId) return true;
  if (
    state.organizer?.supabaseUserId &&
    state.organizer.supabaseUserId === match.organizerId
  ) {
    return true;
  }
  if (state.managedMatchIds.includes(match.id)) return true;
  const personId = state.identity?.personId;
  if (personId && match.managerPersonIds?.includes(personId)) return true;
  const device = state.identity?.deviceKey;
  if (device && match.managerDeviceKeys?.includes(device)) return true;
  const mine = myMatchPlayer(state, match.id);
  if (mine && match.managerPersonIds.includes(mine.personId)) return true;
  const myName = state.identity?.name;
  if (myName && match.managerPersonIds.length > 0) {
    const named = match.managerPersonIds.some((id) => {
      const person = state.people.find((p) => p.id === id);
      return person ? nameKey(person.name) === nameKey(myName) : false;
    });
    if (named) return true;
  }
  return false;
}

export function isCreator(state: AppState, match: Match): boolean {
  return Boolean(state.organizer && state.organizer.id === match.organizerId);
}

export function myMatchPlayer(
  state: AppState,
  matchId: string,
): MatchPlayer | undefined {
  const list = playersOf(state, matchId).filter((p) => p.status !== "removed");
  const device = state.identity?.deviceKey;
  if (device) {
    const byDevice = list.find((p) => p.deviceKey === device);
    if (byDevice) return byDevice;
  }
  if (state.identity?.personId) {
    const byPerson = list.find((p) => p.personId === state.identity?.personId);
    if (byPerson) return byPerson;
  }
  if (state.identity?.name) {
    return list.find((p) => nameKey(p.name) === nameKey(state.identity!.name));
  }
  return undefined;
}
