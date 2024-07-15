export enum RiskScanMessage {
  Stop = 'Risk scanning will stop.',
  Start = 'Risk scanning will start automatically.',
}

export enum UniqueQueryKeys {
  Backends = 'backends',
  MY = 'MY',
  GENERIC_MY_SEARCH = 'GENERIC_MY_SEARCH',
  GET_FILE = 'GET_FILE',
  COUNTS = 'COUNTS',
  GAVATAR_PROFILE_PICTURE = 'GAVATAR_PROFILE_PICTURE',
  KEV = 'KEV',
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
  Resolved = 'C',
  FalsePositive = 'CF',
  Rejected = 'CR',
}

export type RiskCombinedStatus = string;

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
  ActiveLow = 'AL',
  Active = 'A',
  Frozen = 'F',
}

export const AssetStatusLabel: Record<AssetStatus, string> = {
  [AssetStatus.ActiveHigh]: 'Comprehensive Scan',
  [AssetStatus.Active]: 'Standard Scan',
  [AssetStatus.ActiveLow]: 'Asset Discovery',
  [AssetStatus.Frozen]: 'Exclude Asset',
};

export const RiskStatusLabel: Record<RiskStatus, string> = {
  T: 'Pending Triage',
  O: 'Open',
  C: 'Resolved',
  CR: 'Rejected',
  CF: 'False Positive',
};

export enum RiskClosedStatus {
  Resolved = RiskStatus.Resolved,
  Rejected = RiskStatus.Rejected,
  FalsePositive = RiskStatus.FalsePositive,
}

export const RiskClosedStatusLongLabel: Record<RiskClosedStatus, string> = {
  [RiskStatus.Resolved]: 'Mark as Resolved',
  [RiskStatus.Rejected]: 'Reject the Risk',
  [RiskStatus.FalsePositive]: 'False Positive',
};

export const RiskClosedStatusLongDesc: Record<RiskClosedStatus, string> = {
  [RiskStatus.Resolved]:
    'This risk has been addressed and resolved; no further action is required.',
  [RiskStatus.Rejected]:
    'We acknowledge the presence of this risk and accept it, understanding the potential impact.',
  [RiskStatus.FalsePositive]:
    'This risk is deemed to be a false positive or not valid, and no further action will be taken.',
};

export const SeverityDef: Record<RiskSeverity, string> = {
  I: 'Info',
  L: 'Low',
  M: 'Medium',
  H: 'High',
  C: 'Critical',
};

export enum IntegrationType {
  AssetDiscovery = 'Asset Discovery',
  RiskIdentification = 'Risk Identification',
  Workflow = 'Workflow',
}

export const DisplaySeverities: Record<string, string> = {
  analyzing: 'Requires Analysis',
  L: 'Low Risks (Open)',
  M: 'Medium Risks (Open)',
  H: 'High Risks (Open)',
  C: 'Critical Risks (Open)',
  cisa_kev: 'CISA KEV (Open)',
};

export const SeedLabels: Record<string, string> = {
  cloud: 'Integrations',
  ipv4: 'IPv4 Addresses',
  cidr: 'CIDR Ranges',
  repository: 'GitHub Organizations',
  domain: 'Domains',
};

export const FileLabels: Record<string, string> = {
  definition: 'Risk Definitions',
  report: 'Reports',
  proof: 'Proof of Exploits',
  manual: 'Uploaded',
  cti: 'Threat Intelligence',
};

export const AssetLabels: Record<string, string> = {
  ipv4: 'IPv4 Addresses',
  ipv6: 'IPv6 Addresses',
  repository: 'Repositories',
};

export const JobLabels: Record<string, string> = {
  JF: 'Failed',
  JP: 'Completed',
  JQ: 'Queued',
  JR: 'Running',
};

export const OverviewLabels: Record<string, string> = {
  assets: 'Assets',
  risks: 'Risks',
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

// TODO: Discover the unknowns
export interface Asset {
  class: string;
  comment: string;
  config: unknown;
  created: string;
  dns: string;
  seed: boolean;
  history: unknown;
  key: string;
  name: string;
  status: AssetStatus;
  ttl: number;
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
  status: RiskCombinedStatus;
}

export type RiskHistory = {
  from: string;
  to: string;
  updated: string;
  by?: string;
};

export interface Risk extends RiskTemplate {
  class: string;
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

export type Match = {
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
  blob_path: string;
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
  job: Job[];
  seed: Seed[];
  attribute: Attribute[];
  file: MyFile[];
}

export interface GenericResource {
  accounts: Account[];
  risks: Risk[];
  assets: Asset[];
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

export type ChartType = 'area' | 'bar' | 'line' | 'donut';
