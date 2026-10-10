export type FieldType = "small" | "large";
export type MatchStatus = "open" | "closed" | "played";
export type PlayerStatus = "in" | "waitlist" | "out" | "removed";
export type TeamSide = "A" | "B" | "unassigned" | "bench_a" | "bench_b";

export type SmallFormation = "2-2-1" | "2-1-2" | "1-2-2" | "3-1-1" | "1-3-1";
export type LargeFormation =
  | "4-4-2"
  | "4-3-3"
  | "3-5-2"
  | "4-2-3-1"
  | "3-4-3"
  | "5-3-2";
export type FormationId = SmallFormation | LargeFormation;

export type Identity = {
  deviceKey: string;
  name: string;
  isGk: boolean;
  personId: string;
};

export type Organizer = {
  id: string;
  email?: string;
  supabaseUserId?: string;
};

export type Person = {
  id: string;
  name: string;
  isGk: boolean;
};

export type Match = {
  id: string;
  code: string;
  organizerId: string;
  organizerToken: string;
  managerPersonIds: string[];
  managerDeviceKeys: string[];
  title: string;
  startsAt: string;
  location: string;
  notes: string;
  fieldType: FieldType;
  benchSize: number;
  status: MatchStatus;
  formationA: FormationId;
  formationB: FormationId;
  createdAt: string;
};

export type MatchPlayer = {
  id: string;
  matchId: string;
  personId: string;
  name: string;
  isGk: boolean;
  deviceKey?: string;
  team: TeamSide;
  slotIndex: number | null;
  status: PlayerStatus;
  joinedAt: number;
};

export type Rating = {
  raterKey: string;
  rateeId: string;
  score: number;
  matchId?: string;
};

export type AppState = {
  version: 1;
  organizer: Organizer | null;
  identity: Identity | null;
  managedMatchIds: string[];
  people: Person[];
  matches: Match[];
  matchPlayers: MatchPlayer[];
  ratings: Rating[];
};

export type Slot = {
  index: number;
  role: "GK" | "DEF" | "MID" | "ATT";
  x: number;
  y: number;
};
