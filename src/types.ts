import { ReactNode } from 'react';

import { InputsT } from '@/components/form/Inputs';

export enum RiskScanMessage {
  Stop = 'Risk scanning will stop.',
  Start = 'Risk scanning will start automatically.',
  StartHigh = 'Comprehensive risk scanning will start automatically.',
  StartLow = 'Asset discovery will start automatically.',
}

export enum UniqueQueryKeys {
  Backends = 'backends',
  ACCOUNT_ALERTS = 'ACCOUNT_ALERTS',
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
  Scope = 'CS',
  Machine = 'M',
}

export type RiskCombinedStatus = string;

export enum RiskSeverity {
  'Info' = 'I',
  'Low' = 'L',
  'Medium' = 'M',
  'High' = 'H',
  'Critical' = 'C',
}
export enum AssetStatus {
  ActiveHigh = 'AH',
  ActiveLow = 'AL',
  Active = 'A',
  Frozen = 'F',
  Deleted = 'D',
}

export const AssetStatusLabel: Record<AssetStatus, string> = {
  [AssetStatus.ActiveHigh]: 'Comprehensive Scan',
  [AssetStatus.Active]: 'Vulnerability Scan',
  [AssetStatus.ActiveLow]: 'Discovery Only',
  [AssetStatus.Frozen]: 'Excluded',
  [AssetStatus.Deleted]: 'Deleted',
};

export const RiskStatusLabel: Record<RiskStatus, string> = {
  T: 'Pending Triage',
  O: 'Open',
  C: 'Resolved',
  CR: 'Rejected',
  CF: 'False Positive',
  CS: 'Out of Scope',
  M: 'Automatically Closed',
};

export enum RiskClosedStatus {
  Resolved = RiskStatus.Resolved,
  Rejected = RiskStatus.Rejected,
  FalsePositive = RiskStatus.FalsePositive,
  Scope = RiskStatus.Scope,
}

export const RiskClosedStatusLongLabel: Record<RiskClosedStatus, string> = {
  [RiskStatus.Resolved]: 'Mark as Resolved',
  [RiskStatus.Rejected]: 'Reject the Risk',
  [RiskStatus.FalsePositive]: 'False Positive',
  [RiskStatus.Scope]: 'Out of Scope',
};

export const RiskClosedStatusLongDesc: Record<RiskClosedStatus, string> = {
  [RiskStatus.Resolved]:
    'This risk has been addressed and resolved; no further action is required.',
  [RiskStatus.Rejected]:
    'We acknowledge the presence of this risk and accept it, understanding the potential impact.',
  [RiskStatus.FalsePositive]:
    'This risk is deemed to be a false positive or not valid, and no further action will be taken.',
  [RiskStatus.Scope]:
    'This risk is out of scope and will not be addressed or mitigated.',
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

export const ResourceLabels: Record<string, string> = {
  asset: 'Assets',
  risk: 'Risks',
  file: 'Files',
  job: 'Jobs',
  user: 'Users',
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
  [key: string]: AccountMetadata | string | undefined;
}

export interface Asset {
  class: string;
  comment: string;
  config: unknown;
  created: string;
  dns: string;
  history: EntityHistory[];
  key: string;
  name: string;
  source: string;
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
  source: string;
  dns: string;
  id: string;
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

export type EntityHistory = {
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
  history: EntityHistory[];
}

export interface Attribute {
  key: string;
  name: string;
  source: string;
  ttl: number;
  updated: string;
  username: string;
  value: string;
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
  class?: 'report' | 'proof' | 'manual' | 'definition';
}

export interface Statistics {
  status?: { [key: string]: number };
  source?: { [key: string]: number };
  attributes?: { [key: string]: number };
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
  attribute: Attribute[];
  file: MyFile[];
}

export interface GenericResource {
  accounts: Account[];
  risks: Risk[];
  assets: Asset[];
  jobs: Job[];
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
  name: string;
  client_id: string;
  api: string;
  username?: string;
  password?: string;
  userPoolId: string;
}

export interface BackendStack {
  backend: string;
  clientId: string;
  api: string;
  userPoolId: string;
}

export interface AuthState extends BackendStack {
  me: string;
  friend: { email: string; displayName: string };
  isImpersonating: boolean;
}

export interface AuthContextType extends AuthState {
  getToken: () => Promise<string>;
  confirmOTP: (username: string, password: string, opt: string) => void;
  error: string;
  isLoading: boolean;
  login: (username?: string, password?: string) => void;
  logout: () => void;
  setBackendStack: (backend?: BackendStack) => void;
  setError: (error: string) => void;
  signup: (username: string, password: string, gotoNext: () => void) => void;
  startImpersonation: (memberId: string, displayName: string) => void;
  stopImpersonation: () => void;
}

export interface CognitoAuthStates {
  idToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export type ChartType = 'area' | 'bar' | 'line' | 'donut';

export enum Module {
  PM = 'PM',
  ASM = 'ASM',
  BAS = 'BAS',
  CTI = 'CTI',
  VM = 'VM',
  CPT = 'CPT',
}
export interface ModuleMeta {
  label: string;
  name: string;
  description: string;
  defaultTab?: JSX.Element;
  risks: number;
  Icon: JSX.Element;
  integrations: IntegrationMeta[];
}

export enum Integration {
  hook = 'hook',
  webhook = 'webhook',
  slack = 'slack',
  jira = 'jira',
  github = 'github',
  amazon = 'amazon',
  ns1 = 'ns1',
  gcp = 'gcp',
  azure = 'azure',
  crowdstrike = 'crowdstrike',
  gitlab = 'gitlab',
  nessus = 'nessus',
  zulip = 'zulip',
  basAgent = 'basAgent',
  kev = 'kev',
  teams = 'teams',
}

export interface IntegrationMeta {
  id: Integration;
  name: string;
  description?: ReactNode;
  logo?: string;
  inputs?: InputsT;
  warning?: string;
  message?: JSX.Element;
  markup?: JSX.Element;
  multiple?: boolean;
  help?: {
    href: string;
    label: string;
  };
}
