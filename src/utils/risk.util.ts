import { Risk } from '@/types';

interface GitHubRepo {
  name: string;
  enum_time: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  can_fork: boolean;
  runner_workflows: string[];
  accessible_runners: string[];
  repo_runners: string[];
  repo_secrets: string[];
  org_secrets: string[];
}

interface GitHubEnumeration {
  username: string;
  scopes: string[];
  enumeration: {
    timestamp: string;
    organizations: unknown[];
    repositories: GitHubRepo[];
  };
}

function isGitHubEnumeration(
  file: unknown
): file is Partial<GitHubEnumeration> {
  return (
    typeof file === 'object' &&
    file !== null &&
    'username' in file &&
    'scopes' in file &&
    'enumeration' in file
  );
}

function processGitHubEnumeration(
  file: Partial<GitHubEnumeration>
): Record<string, unknown> {
  const repoDetails = file.enumeration?.repositories?.map(repo => ({
    'Repository Name': repo.name,
    'Enumeration Time': repo.enum_time,
    Permissions: repo.permissions,
    'Can Fork': repo.can_fork,
    'Runner Workflows': repo.runner_workflows,
    'Accessible Runners': repo.accessible_runners,
    'Repo Runners': repo.repo_runners,
    'Repo Secrets': repo.repo_secrets,
    'Org Secrets': repo.org_secrets,
  }));

  const data = {
    Repositories: JSON.stringify(repoDetails, null, 2) ?? '',
    Scopes: JSON.stringify(file.scopes, null, 2) ?? '',
    Timestamp: file.enumeration?.timestamp ?? '',
    Username: file.username ?? '',
  };

  return data;
}

interface NucleiTemplate {
  'curl-command': string;
  request: string;
  'template-encoded': string;
  response: string;
  'extracted-results'?: string[];
  'matched-at'?: string;
}

function isNucleiTemplate(file: unknown): file is Partial<NucleiTemplate> {
  return typeof file === 'object' && file !== null && 'template-id' in file;
}

function processNucleiTemplate(
  file: Partial<NucleiTemplate>
): Record<string, unknown> {
  const decodedRule = file['template-encoded']
    ? atob(file['template-encoded'])
    : '';

  return {
    Response: file.response?.trim() ?? '[Not Available]',
    Request: file.request?.trim() ?? '[Not Available]',
    Command: file['curl-command']?.trim() ?? '[Not Available]',
    Extracted: file['extracted-results'] ?? '[Not Available]',
    'Matched At': file['matched-at'] ?? '[Not Available]',
    Rule: decodedRule,
  };
}

interface NoseyParkerTemplate {
  finding_id: number;
  rule_name: string;
  rule_text_id: string;
  rule_structural_id: string;
  num_matches: number;
  matches: {
    provenance: {
      repo_path: string;
      first_commit: {
        commit_metadata: {
          commit_id: string;
          committer_name: string;
          committer_email: string;
          message: string;
        };
        blob_path: string;
      };
    }[];
    blob_id: string;
    snippet: {
      before: string;
      matching: string;
      after: string;
    };
    location: {
      source_span: {
        start: {
          line: number;
        };
        end: {
          line: number;
        };
      };
    };
  }[];
}

function isNoseyParkerTemplate(
  file: unknown
): file is Partial<NoseyParkerTemplate> {
  return typeof file === 'object' && file !== null && 'finding_id' in file;
}

function processNoseyParkerTemplate(
  file: Partial<NoseyParkerTemplate>
): Record<string, unknown> {
  if (typeof file !== 'object' || file === null) {
    return {};
  }

  const formattedMatches = (file.matches || []).map(match => ({
    'Repository Path': match.provenance?.[0]?.repo_path || '',
    'First Commit ID':
      match.provenance?.[0]?.first_commit?.commit_metadata?.commit_id || '',
    'First Committer Name':
      match.provenance?.[0]?.first_commit?.commit_metadata?.committer_name ||
      '',
    'First Committer Email':
      match.provenance?.[0]?.first_commit?.commit_metadata?.committer_email ||
      '',
    'First Commit Message':
      match.provenance?.[0]?.first_commit?.commit_metadata?.message || '',
    'File Path': match.provenance?.[0]?.first_commit?.blob_path || '',
    'Blob ID': match.blob_id || '',
    'Snippet Before': match.snippet?.before || '',
    'Snippet Matching': match.snippet?.matching || '',
    'Snippet After': match.snippet?.after || '',
    'Start Line': String(match.location?.source_span?.start?.line || ''),
    'End Line': String(match.location?.source_span?.end?.line || ''),
  }));

  return {
    Matches: JSON.stringify(formattedMatches, null, 2),
    'Number of Matches': String(file.num_matches || 0),
    'Finding ID': String(file.finding_id || ''),
    'Rule Name': String(file.rule_name || ''),
    'Rule Text ID': String(file.rule_text_id || ''),
    'Rule Structural ID': String(file.rule_structural_id || ''),
  };
}

interface NetworkTemplate {
  ip: string;
  metadata: {
    entries: {
      address: string;
      owner: string;
      program: number;
      protocol: string;
      version: number;
    }[];
  };
  port: number;
  protocol: string;
  tls: boolean;
  transport: string;
}

function isNetworkTemplate(file: unknown): file is Partial<NetworkTemplate> {
  return (
    typeof file === 'object' &&
    file !== null &&
    'ip' in file &&
    'metadata' in file
  );
}

function processNetworkTemplate(
  file: Partial<NetworkTemplate>
): Record<string, unknown> {
  const formattedEntries = (file?.metadata?.entries || []).map(entry => ({
    Address: entry.address || '',
    Owner: entry.owner || '',
    Program: String(entry.program || ''),
    Protocol: entry.protocol || '',
    Version: String(entry.version || ''),
  }));

  return {
    IP: String(file.ip || ''),
    Port: String(file.port || ''),
    Protocol: String(file.protocol || ''),
    TLS: String(file.tls || ''),
    Transport: String(file.transport || ''),
    Metadata: JSON.stringify(formattedEntries, null, 2),
  };
}

const getDescription = (file: unknown): Record<string, unknown> => {
  if (isNucleiTemplate(file)) {
    return processNucleiTemplate(file as Partial<NucleiTemplate>);
  } else if (isGitHubEnumeration(file)) {
    return processGitHubEnumeration(file as Partial<GitHubEnumeration>);
  } else if (isNoseyParkerTemplate(file)) {
    return processNoseyParkerTemplate(file as Partial<NoseyParkerTemplate>);
  } else if (isNetworkTemplate(file)) {
    return processNetworkTemplate(file as Partial<NetworkTemplate>);
  } else if (typeof file === 'object' && file !== null) {
    // Function to iterate over keys and create sections if applicable
    const createSections = (
      data: Record<string, unknown>
    ): Record<string, unknown> => {
      const sections: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        sections[key] =
          typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2)
            : String(value);
      });
      return sections;
    };

    // Create sections for the parsed file
    return createSections(file as Record<string, unknown>);
  } else if (file !== undefined) {
    return { Data: file?.toString() || '' };
  }

  return {};
};

export const isManualORPRrovidedRisk = (risk: Risk) =>
  risk.source.includes('@') || risk.source === 'provided';

export { getDescription };
