import { nextJoinStatus } from "./capacity";
import { isSupabaseEnabled } from "./supabase";
import { defaultFormation, formationsFor } from "./formations";
import { matchCode, nameKey, normalizeName, raterKey, uid } from "./id";
import { isOrganizer } from "./selectors";
import {
  clearTeams,
  movePlayer,
  relayoutTeam,
  splitByRating,
  splitRandom,
} from "./teams";
import type {
  AppState,
  FieldType,
  FormationId,
  Match,
  MatchPlayer,
  Person,
  TeamSide,
} from "./types";

function upsertPerson(state: AppState, name: string, isGk: boolean): {
  state: AppState;
  person: Person;
} {
  const key = nameKey(name);
  const existing = state.people.find((p) => nameKey(p.name) === key);
  if (existing) {
    const person = existing.isGk === isGk ? existing : { ...existing, isGk };
    return {
      state: {
        ...state,
        people: state.people.map((p) => (p.id === person.id ? person : p)),
      },
      person,
    };
  }
  const person: Person = { id: uid("p"), name: normalizeName(name), isGk };
  return { state: { ...state, people: [...state.people, person] }, person };
}

function promoteWaitlist(match: Match, players: MatchPlayer[]): MatchPlayer[] {
  const waiting = players
    .filter((p) => p.status === "waitlist")
    .sort((a, b) => a.joinedAt - b.joinedAt);
  if (waiting.length === 0) return players;
  const others = players.filter((p) => p.status !== "waitlist");
  const pick =
    waiting.find((w) => nextJoinStatus(match, others, w) === "in") ?? waiting[0]!;
  if (nextJoinStatus(match, others, pick) !== "in") return players;
  return players.map((p) =>
    p.id === pick.id
      ? { ...p, status: "in", team: "unassigned", slotIndex: null }
      : p,
  );
}

export function becomeOrganizer(state: AppState, email?: string): AppState {
  if (state.organizer) {
    return email
      ? { ...state, organizer: { ...state.organizer, email } }
      : state;
  }
  return { ...state, organizer: { id: uid("org"), email } };
}

export function logoutOrganizer(state: AppState): AppState {
  return { ...state, organizer: null };
}

export function rememberIdentity(
  state: AppState,
  input: { name: string; isGk: boolean; deviceKey?: string },
): AppState {
  const deviceKey = input.deviceKey ?? state.identity?.deviceKey ?? uid("dev");
  const { state: next, person } = upsertPerson(state, input.name, input.isGk);
  return {
    ...next,
    identity: {
      deviceKey,
      name: person.name,
      isGk: person.isGk,
      personId: person.id,
    },
  };
}

export function clearIdentity(state: AppState): AppState {
  return { ...state, identity: null };
}

export function createMatch(
  state: AppState,
  input: {
    title: string;
    startsAt: string;
    location: string;
    notes: string;
    fieldType: FieldType;
    benchSize: number;
  },
): { state: AppState; match: Match } {
  if (!state.organizer) throw new Error("Duhet të hysh si organizator");
  if (isSupabaseEnabled() && !state.organizer.supabaseUserId) {
    throw new Error("Hyr me email para se të krijosh termin");
  }
  const organizerId = state.organizer.supabaseUserId ?? state.organizer.id;
  const formation = defaultFormation(input.fieldType);
  const match: Match = {
    id: uid("m"),
    code: matchCode(),
    organizerId,
    organizerToken: uid("ot"),
    managerPersonIds: [],
    managerDeviceKeys: [],
    title: input.title.trim() || "Termin",
    startsAt: input.startsAt,
    location: input.location.trim(),
    notes: input.notes.trim(),
    fieldType: input.fieldType,
    benchSize: Math.max(0, Math.min(6, input.benchSize)),
    status: "open",
    formationA: formation,
    formationB: formation,
    createdAt: new Date().toISOString(),
  };
  return { state: { ...state, matches: [match, ...state.matches] }, match };
}

export function updateMatch(
  state: AppState,
  matchId: string,
  patch: Partial<
    Pick<
      Match,
      | "title"
      | "startsAt"
      | "location"
      | "notes"
      | "fieldType"
      | "benchSize"
      | "status"
      | "formationA"
      | "formationB"
    >
  >,
): AppState {
  return {
    ...state,
    matches: state.matches.map((m) => {
      if (m.id !== matchId) return m;
      const next = { ...m, ...patch };
      if (patch.fieldType && patch.fieldType !== m.fieldType) {
        const allowed = formationsFor(patch.fieldType);
        if (!allowed.includes(next.formationA)) next.formationA = allowed[0]!;
        if (!allowed.includes(next.formationB)) next.formationB = allowed[0]!;
      }
      return next;
    }),
  };
}

export function deleteMatch(state: AppState, matchId: string): AppState {
  return {
    ...state,
    matches: state.matches.filter((m) => m.id !== matchId),
    matchPlayers: state.matchPlayers.filter((p) => p.matchId !== matchId),
  };
}

function joinInternal(
  state: AppState,
  match: Match,
  person: Person,
  deviceKey: string | undefined,
): AppState {
  const existing = state.matchPlayers.find(
    (p) =>
      p.matchId === match.id &&
      (p.personId === person.id ||
        (deviceKey && p.deviceKey === deviceKey)) &&
      p.status !== "removed",
  );

  if (existing) {
    if (existing.status === "in" || existing.status === "waitlist") return state;
    const others = state.matchPlayers.filter((p) => p.id !== existing.id);
    const status = nextJoinStatus(match, others, person);
    return {
      ...state,
      matchPlayers: state.matchPlayers.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              name: person.name,
              isGk: person.isGk,
              personId: person.id,
              deviceKey: deviceKey ?? p.deviceKey,
              status,
              team: "unassigned",
              slotIndex: null,
              joinedAt: Date.now(),
            }
          : p,
      ),
    };
  }

  const status = nextJoinStatus(match, state.matchPlayers.filter((p) => p.matchId === match.id), person);
  const row: MatchPlayer = {
    id: uid("mp"),
    matchId: match.id,
    personId: person.id,
    name: person.name,
    isGk: person.isGk,
    deviceKey,
    team: "unassigned",
    slotIndex: null,
    status,
    joinedAt: Date.now(),
  };
  return { ...state, matchPlayers: [...state.matchPlayers, row] };
}

export function playerJoin(
  state: AppState,
  matchId: string,
  input: { name: string; isGk: boolean },
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match || match.status !== "open") return state;
  const remembered = rememberIdentity(state, {
    name: input.name,
    isGk: input.isGk,
  });
  if (!remembered.identity) return state;
  const person = remembered.people.find(
    (p) => p.id === remembered.identity?.personId,
  );
  if (!person) return remembered;
  return joinInternal(remembered, match, person, remembered.identity.deviceKey);
}

export function organizerAddPlayer(
  state: AppState,
  matchId: string,
  input: { name: string; isGk: boolean; personId?: string },
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return state;
  let next = state;
  let person: Person | undefined = input.personId
    ? next.people.find((p) => p.id === input.personId)
    : undefined;
  if (!person) {
    const up = upsertPerson(next, input.name, input.isGk);
    next = up.state;
    person = up.person;
  }
  return joinInternal(next, match, person, undefined);
}

export function playerOut(state: AppState, matchId: string): AppState {
  const device = state.identity?.deviceKey;
  if (!device) return state;
  const row = state.matchPlayers.find(
    (p) => p.matchId === matchId && p.deviceKey === device && p.status !== "removed",
  );
  if (!row) return state;
  return removeOrOut(state, matchId, row.id, "out");
}

export function organizerRemove(
  state: AppState,
  matchId: string,
  playerId: string,
): AppState {
  return removeOrOut(state, matchId, playerId, "removed");
}

function removeOrOut(
  state: AppState,
  matchId: string,
  playerId: string,
  status: "out" | "removed",
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return state;
  let players = state.matchPlayers.map((p) =>
    p.id === playerId
      ? { ...p, status, team: "unassigned" as const, slotIndex: null }
      : p,
  );
  const ofMatch = players.filter((p) => p.matchId === matchId);
  const promoted = promoteWaitlist(match, ofMatch);
  const others = players.filter((p) => p.matchId !== matchId);
  return { ...state, matchPlayers: [...others, ...promoted] };
}

export function setFormation(
  state: AppState,
  matchId: string,
  side: "A" | "B",
  formation: FormationId,
): AppState {
  const updated = updateMatch(
    state,
    matchId,
    side === "A" ? { formationA: formation } : { formationB: formation },
  );
  const ofMatch = updated.matchPlayers.filter((p) => p.matchId === matchId);
  const others = updated.matchPlayers.filter((p) => p.matchId !== matchId);
  return {
    ...updated,
    matchPlayers: [...others, ...relayoutTeam(ofMatch, side, formation)],
  };
}

export function divideTeams(
  state: AppState,
  matchId: string,
  mode: "random" | "rating" | "shuffle",
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return state;
  const ofMatch = state.matchPlayers.filter((p) => p.matchId === matchId);
  const next =
    mode === "rating"
      ? splitByRating(ofMatch, state.ratings, match.formationA, match.formationB)
      : splitRandom(ofMatch, match.formationA, match.formationB);
  const others = state.matchPlayers.filter((p) => p.matchId !== matchId);
  return { ...state, matchPlayers: [...others, ...next] };
}

export function resetTeams(state: AppState, matchId: string): AppState {
  const ofMatch = state.matchPlayers.filter((p) => p.matchId === matchId);
  const others = state.matchPlayers.filter((p) => p.matchId !== matchId);
  return { ...state, matchPlayers: [...others, ...clearTeams(ofMatch)] };
}

export function assignPlayer(
  state: AppState,
  matchId: string,
  playerId: string,
  team: TeamSide,
  slotIndex: number | null = null,
): AppState {
  const ofMatch = state.matchPlayers.filter((p) => p.matchId === matchId);
  const others = state.matchPlayers.filter((p) => p.matchId !== matchId);
  return {
    ...state,
    matchPlayers: [...others, ...movePlayer(ofMatch, playerId, team, slotIndex)],
  };
}

export function ratePerson(
  state: AppState,
  rateeId: string,
  score: number,
): AppState {
  const key = raterKey({
    organizerId: state.organizer?.id,
    deviceKey: state.identity?.deviceKey,
  });
  if (!key) return state;
  if (state.identity?.personId === rateeId) return state;
  const clamped = Math.min(10, Math.max(1, Math.round(score)));
  const rest = state.ratings.filter(
    (r) => !(r.raterKey === key && r.rateeId === rateeId),
  );
  return { ...state, ratings: [...rest, { raterKey: key, rateeId, score: clamped }] };
}

export function addRosterPlayer(
  state: AppState,
  input: { name: string; isGk: boolean },
): AppState {
  return upsertPerson(state, input.name, input.isGk).state;
}

export function removeRosterPlayer(state: AppState, personId: string): AppState {
  return {
    ...state,
    people: state.people.filter((p) => p.id !== personId),
  };
}

export function addMatchManager(
  state: AppState,
  matchId: string,
  playerId: string,
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match || !isOrganizer(state, match)) return state;
  const player = state.matchPlayers.find(
    (p) => p.id === playerId && p.matchId === matchId,
  );
  if (!player) return state;
  const managerPersonIds = match.managerPersonIds.includes(player.personId)
    ? match.managerPersonIds
    : [...match.managerPersonIds, player.personId];
  const managerDeviceKeys =
    player.deviceKey && !match.managerDeviceKeys.includes(player.deviceKey)
      ? [...match.managerDeviceKeys, player.deviceKey]
      : match.managerDeviceKeys;
  return {
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId ? { ...m, managerPersonIds, managerDeviceKeys } : m,
    ),
  };
}

export function removeMatchManager(
  state: AppState,
  matchId: string,
  personId: string,
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match || !isOrganizer(state, match)) return state;
  const devices = state.matchPlayers
    .filter((p) => p.matchId === matchId && p.personId === personId)
    .map((p) => p.deviceKey)
    .filter((key): key is string => Boolean(key));
  return {
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            managerPersonIds: m.managerPersonIds.filter((id) => id !== personId),
            managerDeviceKeys: m.managerDeviceKeys.filter((key) => !devices.includes(key)),
          }
        : m,
    ),
    managedMatchIds: state.managedMatchIds.filter((id) => {
      if (id !== matchId) return true;
      return state.identity?.personId !== personId;
    }),
  };
}

export function claimOrganizerRole(
  state: AppState,
  matchId: string,
  token: string,
): AppState {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match || !token || match.organizerToken !== token) return state;
  const withOrg = becomeOrganizer(state);
  const device = withOrg.identity?.deviceKey;
  const personId = withOrg.identity?.personId;
  return {
    ...withOrg,
    managedMatchIds: withOrg.managedMatchIds.includes(matchId)
      ? withOrg.managedMatchIds
      : [...withOrg.managedMatchIds, matchId],
    matches: withOrg.matches.map((m) => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        managerPersonIds:
          personId && !m.managerPersonIds.includes(personId)
            ? [...m.managerPersonIds, personId]
            : m.managerPersonIds,
        managerDeviceKeys:
          device && !m.managerDeviceKeys.includes(device)
            ? [...m.managerDeviceKeys, device]
            : m.managerDeviceKeys,
      };
    }),
  };
}
