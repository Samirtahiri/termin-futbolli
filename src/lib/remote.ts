import { getSupabase, isSupabaseEnabled } from "./supabase";
import type {
  AppState,
  FieldType,
  FormationId,
  Match,
  MatchPlayer,
  MatchStatus,
  Person,
  Rating,
  TeamSide,
} from "./types";

type MatchRow = {
  id: string;
  code: string;
  organizer_id: string;
  organizer_token: string;
  manager_person_ids: string[] | null;
  manager_device_keys: string[] | null;
  title: string;
  starts_at: string;
  location: string;
  notes: string;
  field_type: FieldType;
  bench_size: number;
  status: MatchStatus;
  formation_a: FormationId;
  formation_b: FormationId;
  created_at: string;
};

type PlayerRow = {
  id: string;
  match_id: string;
  person_id: string;
  name: string;
  is_gk: boolean;
  device_key: string | null;
  team: TeamSide;
  slot_index: number | null;
  status: MatchPlayer["status"];
  joined_at: number;
};

type PersonRow = { id: string; name: string; is_gk: boolean };
type RatingRow = { rater_key: string; ratee_id: string; score: number };

function ratingFromRow(row: RatingRow): Rating {
  const sep = row.rater_key.indexOf("::");
  return {
    raterKey: sep === -1 ? row.rater_key : row.rater_key.slice(0, sep),
    matchId: sep === -1 ? undefined : row.rater_key.slice(sep + 2),
    rateeId: row.ratee_id,
    score: row.score,
  };
}

function ratingToRow(rating: Rating): RatingRow {
  return {
    rater_key: rating.matchId
      ? `${rating.raterKey}::${rating.matchId}`
      : rating.raterKey,
    ratee_id: rating.rateeId,
    score: rating.score,
  };
}

export type PulledMatch = {
  match: Match;
  players: MatchPlayer[];
  people: Person[];
  ratings: Rating[];
};

function matchFromRow(row: MatchRow): Match {
  return {
    id: row.id,
    code: row.code,
    organizerId: row.organizer_id,
    organizerToken: row.organizer_token,
    managerPersonIds: row.manager_person_ids ?? [],
    managerDeviceKeys: row.manager_device_keys ?? [],
    title: row.title,
    startsAt: row.starts_at,
    location: row.location,
    notes: row.notes,
    fieldType: row.field_type,
    benchSize: row.bench_size,
    status: row.status,
    formationA: row.formation_a,
    formationB: row.formation_b,
    createdAt: row.created_at,
  };
}

function matchToRow(match: Match): MatchRow {
  return {
    id: match.id,
    code: match.code,
    organizer_id: match.organizerId,
    organizer_token: match.organizerToken,
    manager_person_ids: match.managerPersonIds,
    manager_device_keys: match.managerDeviceKeys,
    title: match.title,
    starts_at: match.startsAt,
    location: match.location,
    notes: match.notes,
    field_type: match.fieldType,
    bench_size: match.benchSize,
    status: match.status,
    formation_a: match.formationA,
    formation_b: match.formationB,
    created_at: match.createdAt,
  };
}

function playerFromRow(row: PlayerRow): MatchPlayer {
  return {
    id: row.id,
    matchId: row.match_id,
    personId: row.person_id,
    name: row.name,
    isGk: row.is_gk,
    deviceKey: row.device_key ?? undefined,
    team: row.team,
    slotIndex: row.slot_index,
    status: row.status,
    joinedAt: row.joined_at,
  };
}

function playerToRow(player: MatchPlayer): PlayerRow {
  return {
    id: player.id,
    match_id: player.matchId,
    person_id: player.personId,
    name: player.name,
    is_gk: player.isGk,
    device_key: player.deviceKey ?? null,
    team: player.team,
    slot_index: player.slotIndex,
    status: player.status,
    joined_at: player.joinedAt,
  };
}

export function mergePulled(state: AppState, pulled: PulledMatch): AppState {
  const peopleMap = new Map(state.people.map((p) => [p.id, p]));
  pulled.people.forEach((p) => peopleMap.set(p.id, p));
  const ratingMap = new Map(
    state.ratings.map((r) => [`${r.raterKey}:${r.rateeId}:${r.matchId ?? ""}`, r]),
  );
  pulled.ratings.forEach((r) =>
    ratingMap.set(`${r.raterKey}:${r.rateeId}:${r.matchId ?? ""}`, r),
  );
  return {
    ...state,
    matches: [
      ...state.matches.filter((m) => m.id !== pulled.match.id),
      pulled.match,
    ],
    people: [...peopleMap.values()],
    matchPlayers: [
      ...state.matchPlayers.filter((p) => p.matchId !== pulled.match.id),
      ...pulled.players,
    ],
    ratings: [...ratingMap.values()],
  };
}

export async function pullMatch(code: string): Promise<PulledMatch | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: matchRow, error } = await sb
    .from("matches")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error || !matchRow) return null;
  const match = matchFromRow(matchRow as MatchRow);
  const { data: playerRows } = await sb
    .from("match_players")
    .select("*")
    .eq("match_id", match.id);
  const players = ((playerRows ?? []) as PlayerRow[]).map(playerFromRow);
  const personIds = [
    ...new Set(players.map((p) => p.personId)),
    ...match.managerPersonIds,
  ];
  const { data: peopleRows } = personIds.length
    ? await sb.from("people").select("*").in("id", personIds)
    : { data: [] };
  const people = ((peopleRows ?? []) as PersonRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    isGk: p.is_gk,
  }));
  const { data: ratingRows } = personIds.length
    ? await sb.from("ratings").select("*").in("ratee_id", personIds)
    : { data: [] };
  const ratings = ((ratingRows ?? []) as RatingRow[]).map((r) =>
    ratingFromRow(r),
  );
  return { match, players, people, ratings };
}

export async function pullOrganizerMatches(
  organizerId: string,
): Promise<Match[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("matches")
    .select("*")
    .eq("organizer_id", organizerId)
    .order("starts_at", { ascending: false });
  return ((data ?? []) as MatchRow[]).map(matchFromRow);
}

export async function pushAppState(state: AppState): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  if (state.people.length) {
    const { error } = await sb.from("people").upsert(
      state.people.map((p) => ({ id: p.id, name: p.name, is_gk: p.isGk })),
    );
    if (error) console.error("supabase people", error.message);
  }
  if (state.matches.length) {
    const { error } = await sb
      .from("matches")
      .upsert(state.matches.map(matchToRow));
    if (error) console.error("supabase matches", error.message);
  }
  if (state.matchPlayers.length) {
    const { error } = await sb
      .from("match_players")
      .upsert(state.matchPlayers.map(playerToRow));
    if (error) console.error("supabase players", error.message);
  }
  if (state.ratings.length) {
    const { error } = await sb.from("ratings").upsert(
      state.ratings.map(ratingToRow),
    );
    if (error) console.error("supabase ratings", error.message);
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pending: AppState | null = null;

export function schedulePush(state: AppState): void {
  if (!isSupabaseEnabled()) return;
  pending = state;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const next = pending;
    pending = null;
    if (next) void pushAppState(next);
  }, 350);
}

export function subscribeMatch(
  code: string,
  onChange: () => void,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb
    .channel(`termin:${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "matches" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "match_players" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "ratings" },
      onChange,
    )
    .subscribe();
  return () => {
    void sb.removeChannel(channel);
  };
}

export async function deleteRemoteMatch(matchId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("matches").delete().eq("id", matchId);
}
