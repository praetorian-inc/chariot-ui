export enum UniqueQueryKeys {
  Backends = 'backends',
  MY = 'MY',
  GENERIC_MY_SEARCH = 'GENERIC_MY_SEARCH',
  GET_FILE = 'GET_FILE',
  COUNTS = 'COUNTS',
}

export enum JobStatus {
  Queued = 'JQ',
  Running = 'JR',
  Fail = 'JF',
  Pass = 'JP',
}
export enum RiskStatus {
  Triaged = 'T',
  Opened = 'O',
  Closed = 'C',
}
export enum RiskStatusSub {
  Progress = 'P',
  Accepted = 'A',
  Fixed = 'F',
  Rejected = 'R',
}
export enum RiskSeverity {
  'Info' = 'I',
  'Low' = 'L',
  'Medium' = 'M',
  'High' = 'H',
  'Critical' = 'C',
}
export enum SeedStatus {
  Active = 'A',
  Frozen = 'F',
}
export enum AssetStatus {
  ActiveHigh = 'AH',
  Active = 'A',
  Frozen = 'F',
  Unknown = 'U',
}

export const StatusDef: Record<RiskStatus, string> = {
  T: 'Triage',
  O: 'Open',
  C: 'Closed',
};

export const StatusSubDef: Record<RiskStatusSub, string> = {
  P: 'In Progress',
  A: 'Accepted',
  F: 'Fixed',
  R: 'Rejected',
};

export const SeverityDef: Record<RiskSeverity, string> = {
  I: 'Info',
  L: 'Low',
  M: 'Medium',
  H: 'High',
  C: 'Critical',
};

export const DisplaySeverities: Record<string, string> = {
  analyzing: 'Requires Analysis',
  L: 'Low Risks (Open)',
  M: 'Medium Risks (Open)',
  H: 'High Risks (Open)',
  C: 'Critical Risks (Open)',
  cisa_kev: 'CISA KEV (Open)',
};

export const SeedLabels: Record<string, string> = {
  cloud: 'Cloud Accounts',
  ipv4: 'IPv4 Addresses',
  cidr: 'CIDR Ranges',
  github: 'GitHub Organizations',
  domain: 'Domains',
};

export const FileLabels: Record<string, string> = {
  definition: 'Risk Definitions',
  report: 'Reports',
  proof: 'Proof of Exploits',
  manual: 'Manually Uploaded Files',
};

export const AssetLabels: Record<string, string> = {
  ipv4: 'IPv4 Addresses',
  ipv6: 'IPv6 Addresses',
  repository: 'Repositories',
  total: 'Total Asset Count',
};

export const JobLabels: Record<string, string> = {
  JF: 'Failed Jobs',
  JP: 'Completed Jobs',
  JQ: 'Queued Jobs',
  JR: 'Running Jobs',
};

interface AccountTemplate {
  username: string;
  key: string;
  updated: string;
}

export interface Account extends AccountTemplate {
  name: string;
  member: string;
  config: AccountMetadata;
  displayName?: string;
  value?: string;
}

export interface LinkAccount {
  username: string;
  member?: string;
  config: AccountMetadata;
  value?: string;
  key?: string;
}

export interface AccountMetadata {
  displayName?: string;
  pin?: string;
}

export interface Asset {
  key: string;
  dns: string;
  name: string;
  comment: string;
  seed: string;
  source: string;
  status: AssetStatus;
  ttl: number;
  created: string;
  updated: string;
  username: string;
}

export interface Job {
  asset: Asset;
  name: string;
  key: string;
  delay: number;
  comment?: string;
  dns: string;
  id: string;
  source: string;
  queue: string;
  status: JobStatus;
  ttl: number;
  updated: string;
  username: string;
}

export interface RiskTemplate {
  key: string;
  name: string;
  comment: string;
  status: RiskStatus;
}

export type RiskHistory = {
  from: string;
  to: string;
  updated: string;
  by?: string;
};

export interface Risk extends RiskTemplate {
  username: string;
  dns: string;
  created: string;
  updated: string;
  ttl: number;
  source: string;
  seed: string;
  history: RiskHistory[];
}

export interface Seed {
  class: string;
  comment: string;
  config: Record<string, string>;
  created: string;
  dns: string;
  history: string | null;
  key: string;
  name: string;
  status: SeedStatus;
  ttl: number;
  updated: string;
  username: string;
}

export interface Attribute {
  key: string;
  dns: string;
  name: string;
  class: string;
  ttl: number;
  updated: string;
  username: string;
}

export interface Reference {
  key: string;
  dns: string;
  name: string;
  class: string;
  ttl: number;
  updated: string;
  username: string;
}

export interface Threat {
  comment: string;
  key: string;
  name: string;
  source: string;
  updated: string;
  username: string;
  value: number;
}

export interface MyFile {
  key: string;
  name: string;
  updated: string;
  username: string;
  class: 'report' | 'proof' | 'manual' | 'definition';
}

export interface Statistics {
  [key: string]: number;
}

export type Secret = {
  finding_id: string;
  rule_name: string;
  rule_text_id: string;
  rule_structural_id: string;
  groups: string[];
  num_matches: number;
  statuses: string[];
  comment: null | string;
  mean_score: null | number;
  matches: Match[];
};

type Match = {
  provenance: Provenance[];
  blob_metadata: BlobMetadata;
  blob_id: string;
  location: Location;
  groups: string[];
  snippet: Snippet;
  structural_id: string;
  rule_structural_id: string;
  rule_text_id: string;
  rule_name: string;
  score: null | number;
  comment: null | string;
  status: null | string;
};

type Provenance = {
  kind: string;
  repo_path: string;
  first_commit: FirstCommit;
};

type FirstCommit = {
  commit_metadata: CommitMetadata;
  blob_path: string;
};

type CommitMetadata = {
  commit_id: string;
  committer_name: string;
  committer_email: string;
  committer_timestamp: string;
  author_name: string;
  author_email: string;
  author_timestamp: string;
  message: string;
};

type BlobMetadata = {
  id: string;
  num_bytes: number;
  mime_essence: string;
  charset: null | string;
};

type Location = {
  offset_span: Span;
  source_span: SourceSpan;
};

type Span = {
  start: number;
  end: number;
};

type SourceSpan = {
  start: Position;
  end: Position;
};

type Position = {
  line: number;
  column: number;
};

type Snippet = {
  before: string;
  matching: string;
  after: string;
};

export interface MyResource {
  account: Account[];
  risk: Risk[];
  asset: Asset[];
  ref: Reference[];
  job: Job[];
  seed: Seed[];
  attribute: Attribute[];
  file: MyFile[];
  threat: Threat[];
}

export interface GenericResource {
  accounts: Account[];
  risks: Risk[];
  assets: Asset[];
  refs: Attribute[];
  jobs: Job[];
  seeds: Seed[];
  attributes: Attribute[];
  files: MyFile[];
  threats: Threat[];
}

export interface Search {
  isLoading?: boolean;
  onSelect: (prefix: keyof MyResource | 'user') => void;
  accounts: Account[];
  risks: Risk[];
  assets: Asset[];
  attributes: Attribute[];
  jobs: Job[];
  seeds: Seed[];
  attribute: Attribute[];
  files: MyFile[];
  threats: Threat[];
  setIsFocused: (isFocused: boolean) => void;
}

export type MyResourceKey = keyof MyResource;

export interface BackendSections {
  [key: string]: BackendType;
}

export interface BackendType {
  api: string;
  client_id: string;
  name: string;
  username?: string;
  password?: string;
}

export interface AuthState {
  token: string;
  backend: string;
  api: string;
  region: string;
  clientId: string;
  me: string;
  rToken?: string;
  expiry?: Date;
  friend: { email: string; displayName: string };
}

export interface AuthContextType extends AuthState {
  setCognitoAuthStates: (props: CognitoAuthStates) => void;
  login: (backend: BackendType) => Promise<void>;
  logout: () => void;
  startImpersonation: (memberId: string, displayName: string) => void;
  stopImpersonation: () => void;
}

export interface CognitoAuthStates {
  idToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
