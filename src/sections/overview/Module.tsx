import { FormEvent, useEffect, useMemo, useState } from 'react';
import { To } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  BookOpen,
  ClipboardList,
  Crosshair,
  Fingerprint,
  GlobeLock,
  Goal,
  Handshake,
  Radar,
  RefreshCcwDot,
} from 'lucide-react';
import { Flag } from 'lucide-react';

import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Input } from '@/components/form/Input';
import { InputText } from '@/components/form/InputText';
import { Link } from '@/components/Link';
import { Loader } from '@/components/Loader';
import { Tooltip } from '@/components/Tooltip';
import WebhookExample from '@/components/ui/WebhookExample';
import { useMy, useUploadFile } from '@/hooks';
import { useBulkAddAsset } from '@/hooks/useAssets';
import { useBulkAddAttributes } from '@/hooks/useAttribute';
import { useCounts } from '@/hooks/useCounts';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useBulkReRunJob } from '@/hooks/useJobs';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { parseKeys } from '@/sections/SearchByType';
import { useAuth } from '@/state/auth';
import {
  Account,
  Attribute,
  Integration,
  IntegrationMeta,
  Module,
  ModuleMeta,
} from '@/types';
import { useMergeStatus } from '@/utils/api';
import { cn } from '@/utils/classname';
import { copyToClipboard } from '@/utils/copyToClipboard.util';
import { getRoute } from '@/utils/route.util';
import { generateUuid } from '@/utils/uuid.util';

const NessusInstructions = () => {
  return (
    <div>
      <p className="mb-4">
        Chariot import scan results from Nessus using the command line interface
        (CLI).
      </p>
      <h1 className="mb-2 text-xl font-bold">
        Install the CLI and configure it by:
      </h1>
      <pre className="mb-4 rounded-md bg-gray-100 p-4">
        <code>pip install praetorian-cli</code>
        <br />
        <code>praetorian configure</code>
      </pre>
      <h1 className="mb-2 mt-4 text-xl font-bold">
        Import Nessus results in one of two ways:
      </h1>
      <div className="">
        <h2 className="mb-2 mt-4 text-lg font-semibold">
          1. Connecting to a Nessus server:
        </h2>
        <pre className="mb-4 rounded-md bg-gray-100 p-4">
          <code>praetorian chariot plugin nessus-api</code>
        </pre>
        <h2 className="mb-2 mt-4 text-lg font-medium">
          2. Using an XML export file:
        </h2>
        <pre className="mb-4 rounded-md bg-gray-100 p-4">
          <code>praetorian chariot plugin nessus-xml</code>
        </pre>
      </div>
      <p className="text-sm">
        For more information, please visit our{' '}
        <a
          href="https://github.com/praetorian-inc/praetorian-cli"
          className="text-blue-500 underline"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub repository
        </a>
        .
      </p>
    </div>
  );
};

const defaultPin = generateUuid();
const uuid = generateUuid();

export const Integrations: Record<Integration, IntegrationMeta> = {
  kev: {
    id: Integration.kev,
    name: 'CISA KEV',
    description: '',
    logo: '/icons/kev.svg',
    inputs: [],
    markup: (
      <div className="text-default-light">
        <div>
          Known Exploited Vulnerabilities - The Cybersecurity & Infrastructure
          Security Agency (CISA) maintains the knowledge on cybersecurity risks
          that are being exploited in the real world.
        </div>
        <div className="mt-2">
          Each Known Exploited Risk (KEV), moves a cybersecurity vulnerability
          from theoretical to practical. Chariot shows you whether your
          organization is susceptible to KEVs so that you can focus attention on
          protecting against attacks that are being used now.
        </div>
      </div>
    ),
  },
  basAgent: {
    id: Integration.basAgent,
    name: 'Command & Control',
    description: 'Create an agent.',
    logo: '/icons/logo.png',
    inputs: [],
    markup: <BasIntegration />,
  },
  webhook: {
    id: Integration.webhook,
    name: 'ServiceNow',
    description: 'Push assets and risks to Chariot.',
    logo: '/icons/ServiceNow.svg',
    inputs: [
      {
        name: 'username',
        value: Integration.webhook,
        hidden: true,
      },
      {
        name: 'value',
        value: 'servicenow',
        hidden: true,
      },
      {
        label: 'Severity',
        value: 'MHC',
        placeholder: 'Select a minimum severity level for your Slack alerts',
        name: 'severities',
        required: true,
        type: Input.Type.SELECT,
        options: [
          { label: 'Info', value: 'ILMHC' },
          { label: 'Low', value: 'LMHC' },
          { label: 'Medium', value: 'MHC' },
          { label: 'High', value: 'HC' },
          { label: 'Critical', value: 'C' },
        ],
      },
      {
        label: 'Scripted REST API',
        value: '',
        placeholder: 'https://webhook.com/services/',
        name: 'webhook',
        required: true,
        info: {
          text: 'The url to POST data to',
        },
      },
      {
        label: 'Basic Authentication Credentials',
        value: 'Authorization',
        placeholder: 'Content-Type: application/json',
        name: 'header',
        required: true,
        disabled: true,
        hidden: true,
      },
      {
        label: 'Token',
        value: '',
        placeholder: 'Bearer token',
        name: 'token',
        required: true,
        info: {
          text: 'Optional, the value to populate `header` with',
        },
      },
    ],
  },
  hook: {
    id: Integration.hook,
    name: 'Inbound Webhook',
    description: 'Push assets and risks to Chariot.',
    logo: '/icons/logo.png',
    inputs: [
      {
        name: 'username',
        value: 'hook',
        hidden: true,
      },
      {
        label: 'Secret Pin',
        value: defaultPin,
        placeholder: uuid,
        name: 'pin',
        hidden: true,
      },
    ],
    markup: <WebhookExample defaultPin={defaultPin} />,
  },
  slack: {
    id: Integration.slack,
    name: 'Slack',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815125222171-Workplace-Messaging#slack',
      label: 'How to: Workplace Messaging - Slack',
    },
    description: 'Receive Slack notifications when new risks are discovered.',
    logo: '/icons/Slack.svg',
    inputs: [
      {
        name: 'username',
        value: 'slack',
        hidden: true,
      },
      {
        label: 'Webhook URL',
        value: '',
        placeholder: 'https://hooks.slack.com/services/',
        name: 'webhook',
        required: true,
        info: {
          url: 'https://api.slack.com/messaging/webhooks',
          text: 'Learn more',
        },
      },
      {
        label: 'Severity',
        value: 'MHC',
        placeholder: 'Select a minimum severity level for your Slack alerts',
        name: 'severities',
        required: true,
        type: Input.Type.SELECT,
        options: [
          { label: 'Info', value: 'ILMHC' },
          { label: 'Low', value: 'LMHC' },
          { label: 'Medium', value: 'MHC' },
          { label: 'High', value: 'HC' },
          { label: 'Critical', value: 'C' },
        ],
      },
    ],
  },
  jira: {
    id: Integration.jira,
    name: 'Atlassian Jira',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815095834267-Ticketing-Systems#jira',
      label: 'How to: Ticketing Systems - Jira',
    },
    description: 'Track and manage risks directly within your Jira project.',
    logo: '/icons/Jira.svg',
    inputs: [
      {
        name: 'username',
        value: 'jira',
        hidden: true,
      },
      {
        label: 'Base URL',
        value: '',
        placeholder: 'https://<your-domain>.atlassian.net',
        name: 'url',
        required: true,
      },
      {
        label: 'User Email',
        value: '',
        placeholder: 'username@yourdomain.com',
        name: 'userEmail',
        required: true,
      },
      {
        label: 'Access Token',
        value: '',
        placeholder:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
        name: 'accessToken',
        type: Input.Type.TEXT_AREA,
        password: true,
        required: true,
        info: {
          url: 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
          text: 'Learn more',
        },
      },
      {
        label: 'Project Key',
        value: '',
        placeholder: 'PROJ',
        name: 'projectKey',
        required: true,
        info: {
          text: 'Learn more',
          content: (
            <>
              <p>
                The project key is the letters prefix of your the issue key. For
                example, if your JIRA issues have keys like CHARIOT-6312 or
                CHARIOT-823, the project key is &quot;CHARIOT&quot;.
              </p>
            </>
          ),
        },
      },
      {
        label: 'Issue Type',
        value: '',
        placeholder: 'Task',
        name: 'issueType',
        required: true,
        info: {
          text: 'Learn more',
          content: (
            <>
              <p>
                Example issue types are Bug, Security Task, etc. Space in the
                issue type is allowed.
              </p>
            </>
          ),
        },
      },
    ],
  },
  github: {
    id: Integration.github,
    name: 'GitHub',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815083333787-Source-Code-Managers#github',
      label: 'How to: Source Code Managers - GitHub',
    },
    description: "Discover your GitHub organization's repositories and risks.",
    logo: '/icons/GitHub.svg',
    multiple: true,
    inputs: [
      {
        name: 'username',
        value: 'github',
        hidden: true,
      },
      {
        label: 'Personal Access Token (PAT)',
        value: '',
        placeholder: 'github_pat_123456abcdefg_123456abcdefg',
        name: 'pat',
        required: true,
        type: Input.Type.PASSWORD,
        info: {
          url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
          text: 'Learn more',
        },
      },
      {
        label: 'GitHub Organization',
        value: '',
        placeholder: 'https://',
        pattern: '^http(s)?://.+$',
        name: 'value',
        required: true,
        info: {
          url: 'https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations',
          text: 'Learn more',
        },
      },
    ],
  },
  amazon: {
    id: Integration.amazon,
    name: 'Amazon Web Services',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815119222811-Cloud-Providers#amazon',
      label: 'How to: Cloud Providers - Amazon',
    },
    description:
      'Discover and scan assets hosted within your AWS organization.',
    logo: '/icons/AWS.svg',
    multiple: true,
    inputs: [
      {
        name: 'username',
        value: 'amazon',
        hidden: true,
      },
      {
        label: 'Account ID',
        value: '',
        placeholder: '123456789012',
        name: 'value',
        required: true,
      },
    ],
    message: (
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900">
          CloudFormation Template Download
        </label>
        <div className="mt-1">
          <a
            className="text-brand"
            href="/templates/aws-permissions-template.yaml"
            download
          >
            aws-permission-template.yaml
          </a>
        </div>
      </div>
    ),
  },
  ns1: {
    id: Integration.ns1,
    name: 'NS1',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815092236443-Asset-Ingestion-Nessus-NS1-and-CrowdStrike#ns1',
      label: 'How to: Asset Ingestion - NS1',
    },
    description: 'Discover and scan assets managed within your NS1 tenant',
    logo: '/icons/NS1.svg',
    inputs: [
      {
        name: 'username',
        value: 'ns1',
        hidden: true,
      },
      {
        name: 'value',
        value: 'ns1',
        hidden: true,
      },
      {
        label: 'API Key',
        value: '',
        placeholder: 'examplejKg34KdVdfg61',
        name: 'ns1_api_key',
        required: true,
        type: Input.Type.PASSWORD,
        info: {
          url: 'https://www.ibm.com/docs/en/ns1-connect?topic=keys-create-api-key',
          text: 'Learn more',
        },
      },
    ],
  },
  gcp: {
    id: Integration.gcp,
    name: 'Google Cloud',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815119222811-Cloud-Providers#gcp',
      label: 'How to: Cloud Providers - Google Cloud',
    },
    description:
      'Discover and scan assets hosted within your GCP organization.',
    logo: '/icons/GoogleCloud.svg',
    multiple: true,
    inputs: [
      {
        name: 'username',
        value: 'gcp',
        hidden: true,
      },
      {
        label: 'Project ID',
        value: '',
        placeholder: 'praetorian-chariot-example',
        name: 'value',
        required: true,
      },
      {
        label: 'Service Account JSON Keyfile',
        value: '',
        placeholder:
          '{\n' +
          '  "type": "service_account",\n' +
          '  "project_id": "PROJECT_ID",\n' +
          '  "private_key_id": "KEY_ID",\n' +
          '  "private_key": "-----BEGIN PRIVATE KEY-----\\nPRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",\n' +
          '  "client_email": "SERVICE_ACCOUNT_EMAIL",\n' +
          '  "client_id": "CLIENT_ID",\n' +
          '  "auth_uri": "https://accounts.google.com/o/oauth2/auth",\n' +
          '  "token_uri": "https://accounts.google.com/o/oauth2/token",\n' +
          '  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",\n' +
          '  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/SERVICE_ACCOUNT_EMAIL"\n' +
          '}',
        name: 'keyfile',
        required: true,
        type: Input.Type.TEXT_AREA,
      },
    ],
  },
  azure: {
    id: Integration.azure,
    name: 'Azure',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815119222811-Cloud-Providers#azure',
      label: 'How to: Cloud Providers - Azure',
    },
    description:
      'Discover and scan assets hosted within your Azure organization',
    logo: '/icons/Azure.svg',
    multiple: true,
    inputs: [
      {
        name: 'username',
        value: 'azure',
        hidden: true,
      },
      {
        label: 'Application ID',
        value: '',
        placeholder: uuid,
        name: 'name',
        required: true,
      },
      {
        label: 'Secret',
        value: '',
        placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        name: 'secret',
        required: true,
        type: Input.Type.PASSWORD,
      },
      {
        label: 'Tenant ID',
        value: '',
        placeholder: uuid,
        name: 'value',
        required: true,
      },
    ],
  },
  crowdstrike: {
    id: Integration.crowdstrike,
    name: 'CrowdStrike',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815092236443-Asset-Ingestion-Nessus-NS1-and-CrowdStrike#crowdstrike',
      label: 'How to: Asset Ingestion - CrowdStrike',
    },
    description:
      'Import your assets from CrowdStrike and identify policy risks',
    logo: '/icons/Crowdstrike.svg',
    inputs: [
      {
        name: 'username',
        value: 'crowdstrike',
        hidden: true,
      },
      {
        label: 'Client ID',
        value: '',
        placeholder: uuid,
        name: 'clientID',
        required: true,
      },
      {
        label: 'Secret',
        value: '',
        placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        name: 'secret',
        required: true,
        type: Input.Type.PASSWORD,
      },
      {
        label: 'Base URL',
        value: '',
        placeholder: 'https://example.praetorianlabs.api.crowdstrike.com',
        name: 'value',
        required: true,
      },
    ],
  },
  gitlab: {
    id: Integration.gitlab,
    name: 'GitLab',
    help: {
      href: 'https://docs.praetorian.com/hc/en-us/articles/25815083333787-Source-Code-Managers#gitlab',
      label: 'How to: Source Code Managers - GitLab',
    },
    description: "Discover your GitLab organization's repositories and risks",
    logo: '/icons/GitLab.svg',
    multiple: true,
    inputs: [
      {
        name: 'username',
        value: 'gitlab',
        hidden: true,
      },
      {
        label: 'Personal Access Token (PAT)',
        value: '',
        placeholder: 'glpat-123456abcdefg-123456abcdefg',
        name: 'pat',
        required: true,
        type: Input.Type.PASSWORD,
        info: {
          url: 'https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html',
          text: 'Learn more',
        },
      },
      {
        label: '(Parent) GitLab Group',
        value: '',
        placeholder: 'https://gitlab.com/gitlab-org',
        pattern: '^http(s)?://.+$',
        name: 'value',
        required: true,
        info: {
          url: 'https://docs.gitlab.com/ee/user/group/',
          text: 'Learn more',
        },
      },
    ],
  },
  nessus: {
    id: Integration.nessus,
    name: 'Nessus Tenable',
    description:
      'Industry-standard vulnerability scanner for comprehensive security assessments.',
    logo: '/icons/Nessus.svg',
    markup: <NessusInstructions />,
  },
  zulip: {
    id: Integration.zulip,
    name: 'Zulip',
    description: 'Receive Zulip notifications when new risks are discovered.',
    logo: '/icons/Zulip.svg',
    inputs: [
      {
        name: 'username',
        value: 'zulip',
        hidden: true,
      },
      {
        label: 'Webhook URL',
        value: '',
        placeholder:
          'https://yourZulipDomain.zulipchat.com/api/v1/external/slack_incoming',
        name: 'webhook',
        required: true,
        info: {
          url: 'https://zulip.com/integrations/doc/slack_incoming',
          text: 'Learn more',
        },
      },
      {
        label: 'Severity',
        value: 'MHC',
        placeholder: 'Select a minimum severity level for your Zulip alerts',
        name: 'severities',
        required: true,
        type: Input.Type.SELECT,
        options: [
          { label: 'Info', value: 'ILMHC' },
          { label: 'Low', value: 'LMHC' },
          { label: 'Medium', value: 'MHC' },
          { label: 'High', value: 'HC' },
          { label: 'Critical', value: 'C' },
        ],
      },
    ],
  },
};

export const Modules: Record<Module, Omit<ModuleMeta, 'risks' | 'status'>> = {
  PM: {
    Icon: <ClipboardList className="size-10 text-default" />,
    name: 'Project Management',
    label: 'Integrate with your existing workflows',
    description: '',
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Project Management</h3>
        <p className="mt-2 text-default-light">
          Security requires continuous management. Chariot makes project
          management easy by integrating with your existing communication and
          remediation applications.
        </p>
        <p className="mt-2 text-default-light">
          Workflow integrations bring Chariot threat management to your existing
          project management workflow.
        </p>
      </div>
    ),
    integrations: [
      Integrations.hook,
      Integrations.webhook,
      Integrations.slack,
      Integrations.jira,
      Integrations.zulip,
    ],
  },
  ASM: {
    Icon: <Radar className="size-10 text-default" />,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization's IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
    defaultTab: (
      <div className="space-y-4 p-4">
        <h3 className="text-2xl font-semibold">Attack Surface Management</h3>
        <p className="text-default-light">
          Attack surface management (ASM) refers to the proactive approach of
          identifying, analyzing, and managing potential points of attack on an
          organization&apos;s IT infrastructure, applications, and networks.
        </p>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold ">
            <Flag className="-mt-1 inline size-4" /> Goal of ASM
          </h4>
          <p className="text-default-light">
            The goal of ASM is to provide visibility of all assets that are
            exposed to external threats—the sum of all possible entry points
            that an attacker can exploit to gain unauthorized access or cause
            damage on your network.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <BookOpen className="-mt-1 inline size-4" /> How ASM Works
          </h4>
          <p className="text-default-light">
            When you provide an Asset as a starting point, Chariot’s
            comprehensive scan protocols the digital doors to your organization.
            Using tools like subfinder, assetfinder, Massscan, whois, and
            others, Chariot seeks, finds, and presents a picture of your Assets.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <RefreshCcwDot className="-mt-1 inline size-4" /> Continuous ASM
          </h4>
          <p className="text-default-light">
            Continuous ASM helps you proactively manage potential
            vulnerabilities and exposures, ensuring your organization&apos;s
            security measures keep pace with the dynamic threat environment.
          </p>
        </div>
      </div>
    ),
    integrations: [
      Integrations.github,
      Integrations.amazon,
      Integrations.ns1,
      Integrations.gcp,
      Integrations.azure,
      Integrations.gitlab,
      Integrations.crowdstrike,
    ],
  },
  BAS: {
    Icon: <Goal className="size-10 text-default" />,
    label: 'Breach and Attack Simulation',
    name: 'BAS',
    description: `Breach and Attack Simulation (BAS) uses automated tools to continuously simulate real-world cyber attacks, helping organizations identify vulnerabilities, improve threat detection, and enhance their overall security posture.`,
    defaultTab: (
      <div className="space-y-4 p-4">
        <h3 className="text-2xl font-semibold">Breach & Attack Simulation</h3>
        <p className="text-default-light">
          Breach and Attack Simulation (BAS) -- Chariot moves past external
          threat identification and uses an automated approach to continuously
          simulate real-world cyber attacks.
        </p>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold ">
            <Flag className="-mt-1 inline size-4" /> Goal of BAS
          </h4>
          <p className="text-default-light">
            Continuous threat exposure testing will help organizations identify
            vulnerabilities, improve threat detection, and enhance their overall
            security posture at an extremely fast pace.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <BookOpen className="-mt-1 inline size-4" /> How BAS Works
          </h4>
          <p className="text-default-light">
            Upload custom TTPs to Chariot to measure your detection and response
            to MITRE ATT&CK techniques. Deploy a 1-kilobyte agent on any device
            and schedule jobs for immediate execution.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <RefreshCcwDot className="-mt-1 inline size-4" /> Continuous BAS
          </h4>
          <p className="text-default-light">
            Stress test your threat detection and response capabilities by
            continuously testing your defenses against the latest attack
            techniques.
          </p>
        </div>
      </div>
    ),
    integrations: [Integrations.basAgent],
  },
  CTI: {
    Icon: <Crosshair className="size-10 text-default" />,
    label: 'Cyber Threat Intelligence',
    name: 'CTI',
    description: `Cyber Threat Intelligence (CTI) involves the collection and analysis of information about potential or current attacks that threaten an organization, helping to inform security decisions and proactive defense strategies.`,
    defaultTab: (
      <div className="space-y-4 p-4">
        <h3 className="text-2xl font-semibold">Cyber Threat Intelligence</h3>
        <p className="text-default-light">
          Cyber Threat Intelligence (CTI) is the codified knowledge and
          understanding of how risks and vulnerabilities affect the real world.
        </p>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold ">
            <Flag className="-mt-1 inline size-4" /> Goal of CTI
          </h4>
          <p className="text-default-light">
            CTI ingests the collection and analysis of information on potential
            or current attacks and tailors output in a way that provides
            relevance that is tailored to real-world organizations. Tailored
            intelligence informs security decisions and proactive defense
            strategies.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <BookOpen className="-mt-1 inline size-4" /> How CTI Works
          </h4>
          <p className="text-default-light">
            Chariot tags Known Exploited Vulnerabilities–risks we know are being
            used to hack into networks– to elevate the Risks that matter most to
            your business.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <RefreshCcwDot className="-mt-1 inline size-4" /> Continuous CTI
          </h4>
          <p className="text-default-light">
            We monitor emerging threat intelligence from a variety of trusted
            sources and provide detailed analysis of new vulnerabilities,
            exploits, and attack vectors.
          </p>
        </div>
      </div>
    ),
    integrations: [Integrations.kev],
  },
  VM: {
    Icon: <GlobeLock className="size-10 text-default" />,
    label: 'Vulnerability Management',
    name: 'VM',
    description: `Our Vulnerability Management (VM) services include identifying, assessing, and mitigating security vulnerabilities across your IT infrastructure to ensure robust protection against potential threats.`,
    defaultTab: (
      <div className="space-y-4 p-4">
        <h3 className="text-2xl font-semibold">Vulnerability Management</h3>
        <p className="text-default-light">
          Our Vulnerability Management (VM) services identify, assess, and
          mitigate security vulnerabilities across your digital infrastructure.
        </p>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold ">
            <Flag className="-mt-1 inline size-4" /> Goal of VM
          </h4>
          <p className="text-default-light">
            Seeing Risks Applied to your Assets is only the first step in the
            security journey. Deciding which risks present the most potential
            harm, specific to your business, is where Chariot Vulnerability
            Management pays dividends.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <BookOpen className="-mt-1 inline size-4" /> How VM Works
          </h4>
          <p className="text-default-light">
            VM services take the CVEs found on your Attack Surface–the Risks
            that represent the most potential harm to your organization–and
            present the most efficient approach to securing your Assets.
          </p>
        </div>
        <div className="rounded-md bg-gray-100 p-4 shadow-sm">
          <h4 className="font-semibold">
            <Handshake className="-mt-1 inline size-4" /> Tailored Remediation
          </h4>
          <p className="text-default-light">
            Chariot provides the data, up front, in a way that allows a tailored
            remediation approach.
          </p>
        </div>
      </div>
    ),
    integrations: [Integrations.nessus],
  },
  CPT: {
    Icon: <Fingerprint className="size-10 text-default" />,
    label: 'Continuous Penetration Testing',
    name: 'CPT',
    description: `Continuous Penetration Testing (CPT) solutions provide ongoing testing and validation of security measures, helping organizations identify and address vulnerabilities in real-time.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">
          Continuous Penetration Testing
        </h3>
        <p className="mt-2 text-default-light">
          {`Leverage Praetorian's security engineer expertise to enhance your operations and focus security where your business needs it most.`}
        </p>
        <p className="mt-2 text-default-light">
          MSP services provide end-to-end management, including proactive
          monitoring, maintenance, and support to ensure optimal performance and
          security.
        </p>
      </div>
    ),
    integrations: [],
  },
};

export type IntegrationData = { isConnected: true; accounts: Account[] };

export type IntegrationsData = Record<Integration, IntegrationData>;

enum systemTypes {
  darwin = 'darwin',
  windows = 'windows',
  linux = 'linux',
}

interface GetModuleDataProps {
  enabled?: boolean;
}

export function useGetModuleData(props?: GetModuleDataProps): {
  data: Record<
    Module,
    {
      noOfRisk: number;
      noOfAsset: number;
      enabled: boolean;
      assetAttributes: Attribute[];
      riskAttributes: Attribute[];
      isLoading: boolean;
      route: To;
    }
  >;
  integrationsData: IntegrationsData;
  isLoading: boolean;
} {
  const { enabled = true } = props || {};

  const { data: assetCount, status: assetCountStatus } = useCounts(
    {
      resource: 'asset',
    },
    { enabled }
  );
  const { data: riskCount, status: riskCountStatus } = useCounts(
    {
      resource: 'risk',
    },
    { enabled }
  );

  const { data: cveRisksGenericSearch } = useGenericSearch(
    { query: 'CVE' },
    { enabled }
  );

  const { data: accounts, status: accountStatus } = useMy(
    {
      resource: 'account',
    },
    { enabled }
  );
  const { data: basAttributes, status: basAttributesStatus } = useMy(
    {
      resource: 'attribute',
      query: '#source#bas',
    },
    { enabled }
  );
  const { data: kevAttributes, status: ctiAttributeStatus } = useMy(
    {
      resource: 'attribute',
      query: '#source#kev',
    },
    { enabled }
  );
  const { data: nessusAttributes, status: nessusAttributesStatus } = useMy(
    {
      resource: 'attribute',
      query: '#source#nessus',
    },
    { enabled }
  );

  const allPraetorianRiskUsernames = Object.keys(
    riskCount?.source || {}
  ).filter(key => key.endsWith('@praetorian.com'));

  const cptRisks = allPraetorianRiskUsernames.reduce((acc, key) => {
    return acc + (riskCount?.source?.[key] || 0);
  }, 0);

  const isManagedServiceAccount = Boolean(
    accounts.find(account => {
      return account.member === 'managed_services@praetorian.com';
    })
  );

  const basAssetAttribute = basAttributes.filter(({ source, value }) => {
    return source.startsWith('#asset') && value === 'bas';
  });
  const basRiskAttribute = basAttributes.filter(({ source, value }) => {
    return source.startsWith('#risk') && value === 'bas';
  });

  const ctiAssetAttribute = kevAttributes.filter(({ source }) => {
    return source.startsWith('#asset');
  });
  const ctiRiskAttribute = kevAttributes.filter(({ source }) => {
    return source.startsWith('#risk');
  });

  const integrationsData = Object.fromEntries(
    Object.values(Integration).map(integration => {
      if (integration === Integration.basAgent) {
        return [
          integration,
          {
            isConnected: basAssetAttribute.length > 0,
            accounts: [],
          },
        ];
      }
      if (integration === Integration.kev) {
        return [
          integration,
          {
            isConnected: true,
            accounts: [],
          },
        ];
      }
      if (integration === Integration.nessus) {
        return [
          integration,
          {
            isConnected: nessusAttributes.length > 0,
            accounts: [],
          },
        ];
      }
      const isConnected =
        accountStatus !== 'pending' &&
        accounts.map(({ member }) => member).includes(integration);

      return [
        integration,
        {
          isConnected,
          accounts: isConnected
            ? accounts.filter(({ member }) => member === integration)
            : [],
        },
      ];
    })
  ) as IntegrationsData;

  const data = {
    ASM: {
      noOfRisk: riskCount
        ? Object.entries(riskCount?.status || {}).reduce((acc, [key, val]) => {
            if (key.startsWith('O')) {
              return acc + val;
            }
            return acc;
          }, 0)
        : 0,
      noOfAsset: assetCount
        ? Object.values(assetCount?.status || {}).reduce(
            (acc, val) => acc + val,
            0
          )
        : 0,
      enabled: true,
      assetAttributes: [],
      riskAttributes: [],
      isLoading:
        riskCountStatus === 'pending' || assetCountStatus === 'pending',
      route: {
        pathname: getRoute(['app', 'risks']),
        search: 'risk-status=%5B"O"%5D',
      },
    },
    BAS: {
      noOfRisk: basRiskAttribute.length,
      noOfAsset: basAssetAttribute.length,
      enabled: isIntegrationsConnected(Module.BAS),
      assetAttributes: basAssetAttribute,
      riskAttributes: basRiskAttribute,
      isLoading: basAttributesStatus === 'pending',
      route: {
        pathname: getRoute(['app', 'risks']),
      },
    },
    CPT: {
      noOfRisk: cptRisks,
      noOfAsset: 0,
      enabled: isManagedServiceAccount,
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending' || riskCountStatus === 'pending',
      route: {
        pathname: getRoute(['app', 'risks']),
        search: `?risk-sources=${encodeURIComponent(JSON.stringify(allPraetorianRiskUsernames))}`,
      },
    },
    CTI: {
      noOfRisk: ctiRiskAttribute.length,
      noOfAsset: ctiAssetAttribute.length,
      enabled: isIntegrationsConnected(Module.CTI),
      assetAttributes: ctiAssetAttribute,
      riskAttributes: ctiRiskAttribute,
      isLoading: ctiAttributeStatus === 'pending',
      route: {
        pathname: getRoute(['app', 'risks']),
        search: 'risk-status=%5B""%5D&risk-intel=%5B"cisa_kev"%5D',
      },
    },
    PM: {
      noOfRisk: 0,
      noOfAsset: 0,
      enabled: isIntegrationsConnected(Module.PM),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
      route: '',
    },
    VM: {
      noOfRisk: cveRisksGenericSearch?.risks?.length || 0,
      noOfAsset: 0,
      enabled: isIntegrationsConnected(Module.VM),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
      route: '',
    },
  };

  function isIntegrationsConnected(module: Module) {
    const isConnected = Modules[module].integrations.find(integration => {
      return integrationsData[integration.id].isConnected;
    });

    return Boolean(isConnected);
  }

  return {
    data,
    integrationsData,
    isLoading:
      useMergeStatus(
        accountStatus,
        basAttributesStatus,
        ctiAttributeStatus,
        assetCountStatus,
        riskCountStatus,
        nessusAttributesStatus
      ) === 'pending',
  };
}

export function BasIntegration() {
  const { me, friend } = useAuth();

  const {
    data: { BAS },
    isLoading,
  } = useGetModuleData();

  const { getAssetDrawerLink } = getDrawerLink();

  const { data: basLabelAttributes, status: basLabelAttributesStatus } = useMy({
    resource: 'attribute',
    query: '#source#labelBas',
  });

  const { data: malwares } = useMy({
    resource: 'file',
    query: '#malware',
  });

  const malwareMap = useMemo(() => {
    return malwares.reduce(
      (acc, malware) => {
        return {
          ...acc,
          [malware.name]: malware.name,
        };
      },
      {} as Record<string, string>
    );
  }, [JSON.stringify(malwares)]);

  const { mutateAsync: createBulkAsset, status: createBulkAssetStatus } =
    useBulkAddAsset();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: bulkReRunJobs } = useBulkReRunJob();

  const {
    mutateAsync: createBulkAttribute,
    status: createBulkAttributeStatus,
  } = useBulkAddAttributes();

  const allAttLabels = useMemo(() => {
    return basLabelAttributes.reduce(
      (acc, { key }) => {
        const assetKey = parseKeys.attributeKey(key);

        return {
          ...acc,
          [assetKey.name]: assetKey.value,
        };
      },
      {} as Record<string, string>
    );
  }, [JSON.stringify(basLabelAttributes)]);

  const [attLabels, setAttLabels] = useState<Record<string, string>>({});

  async function handleEnable() {
    const basAgents = 5;

    const assets = Array(basAgents)
      .fill(0)
      .map(() => {
        return {
          name: generateUuid(),
        };
      });

    const basAssets = await createBulkAsset(assets);

    const attributes = basAssets.map(({ key }) => {
      return { key, name: 'source', value: 'bas' };
    });

    await createBulkAttribute(attributes);
  }

  async function handleFileDrop(files: { content: ArrayBuffer; file: File }[]) {
    const { content } = files[0];

    const fileName = `malware/${selectedAgent}-${selectedPlatform}`;
    await uploadFile({
      name: fileName,
      content,
    });

    const jobs = [
      {
        dns: selectedAgent,
        capability: fileName,
      },
    ];

    await bulkReRunJobs(jobs);
  }

  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      await handleFileDrop([{ content: arrayBuffer, file }]);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      await handleFileDrop([{ content: arrayBuffer, file }]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  async function handleEditLabel(event: FormEvent) {
    event.preventDefault();

    const attributes = BAS.assetAttributes.map(({ key }) => {
      const attributeMeta = parseKeys.attributeKey(key);

      return {
        key: `#asset#${attributeMeta.name}#${attributeMeta.name}`,
        name: 'source',
        value: `labelBas#${attLabels[attributeMeta.name]}`,
      };
    });

    await createBulkAttribute(attributes);
  }

  useEffect(() => {
    if (!isLoading && basLabelAttributesStatus === 'success') {
      const updatedAttLabels = BAS.assetAttributes.reduce(
        (acc, attribute) => {
          const attributeMeta = parseKeys.attributeKey(attribute.key);

          return {
            ...acc,
            [attributeMeta.name]: allAttLabels[attributeMeta.name] || '',
          };
        },
        {} as Record<string, string>
      );

      setAttLabels(updatedAttLabels);
    }
  }, [basLabelAttributesStatus, isLoading]);

  const isEnabled = BAS.assetAttributes.length > 0;

  return (
    <form className="size-full" id="overviewForm" onSubmit={handleEditLabel}>
      {!isEnabled && (
        <div className="mb-4 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 pb-2">
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">
            Breach and Attack Simulation
          </h2>
          <ul className="mb-6 list-inside list-disc text-gray-600">
            <li className="mb-4 flex justify-center">
              <Button
                isLoading={
                  createBulkAssetStatus === 'pending' ||
                  createBulkAttributeStatus === 'pending'
                }
                disabled={BAS.isLoading}
                styleType="primary"
                className=" px-6 py-3 text-lg font-semibold"
                onClick={handleEnable}
              >
                Create Agents
              </Button>
            </li>
            <li className="mb-4">
              Each agent will be assigned a unique identifier. Assign custom
              hostnames for easier management.
            </li>
            <li className="mb-4">
              Upload your TTP binaries to these agents to simulate breaches.
            </li>
            <li className="mb-4">
              Use the provided curl command to execute on your machines, sending
              data back to our system.
            </li>
            <li>
              Analyze the collected data to gain insights into vulnerabilities
              and defense effectiveness.
            </li>
          </ul>
        </div>
      )}
      {isEnabled && (
        <div>
          <div className="">
            <p className="-mt-2 text-sm text-gray-700">
              {`Upload your TTP (Tactics, Techniques, and Procedures) binary for Chariot's internal assessments. Ensure the file is correctly prepared before uploading.`}
            </p>
          </div>
          <label className="mt-4 block text-sm font-medium leading-6 text-gray-900">
            Tactics, Techniques, and Procedures (TTP)
          </label>
          <div className="flex flex-col items-center space-y-2 rounded-sm border border-gray-200 p-4">
            <div className="flex w-full flex-row space-x-4">
              <Dropdown
                menu={{
                  items: BAS.assetAttributes.map(attribute => {
                    const attributeMeta = parseKeys.attributeKey(attribute.key);

                    return {
                      label:
                        allAttLabels[attributeMeta.name] ||
                        attributeMeta.name.split('-')[0],
                      value: attributeMeta.name,
                      onClick: () => {
                        setSelectedAgent(attributeMeta.name);
                      },
                    };
                  }),
                }}
                label={
                  selectedAgent
                    ? allAttLabels[selectedAgent] || selectedAgent.split('-')[0]
                    : 'Select Agent'
                }
                className="w-full"
                endIcon={
                  <ChevronDownIcon className="ml-auto size-4 text-gray-500" />
                }
                value={selectedAgent}
              />
              <Dropdown
                menu={{
                  items: Object.values(systemTypes).map(system => {
                    return {
                      icon: (
                        <img
                          className="size-4"
                          src={`/icons/${system}.svg`}
                          alt={system}
                        />
                      ),
                      label: <div className="w-full capitalize">{system}</div>,
                      value: system,
                      onClick: () => {
                        setSelectedPlatform(system);
                      },
                    };
                  }),
                }}
                startIcon={
                  selectedPlatform && (
                    <img
                      className="size-4"
                      src={`/icons/${selectedPlatform}.svg`}
                      alt={selectedPlatform}
                    />
                  )
                }
                label={selectedPlatform || 'Select Platform'}
                endIcon={
                  <ChevronDownIcon className="ml-auto size-4 text-gray-500" />
                }
                value={selectedPlatform}
                className="w-full capitalize"
              />
            </div>
            <div className="flex w-full items-center">
              <Tooltip
                title={
                  selectedAgent === '' || selectedPlatform === ''
                    ? 'Please select an agent and platform'
                    : 'Drag and drop or click to upload'
                }
              >
                <div
                  className="w-full text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={selectedAgent === '' || selectedPlatform === ''}
                  />
                  <p
                    className={cn(
                      'w-full text-white p-4 text-sm font-medium',
                      selectedAgent === '' || selectedPlatform === ''
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-brand text-white cursor-pointer'
                    )}
                  >
                    Upload Executable
                  </p>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-col pt-4">
            <Loader isLoading={isLoading}>
              {BAS.assetAttributes
                .sort((a, b) => {
                  const bDate = new Date(b.updated);
                  const aDate = new Date(a.updated);

                  return bDate.getTime() - aDate.getTime();
                })
                .map((attribute, index) => {
                  const attributeMeta = parseKeys.attributeKey(attribute.key);

                  return (
                    <div
                      key={index}
                      className="flex flex-row justify-start border-gray-200"
                    >
                      <div className="flex w-full items-center">
                        <div className="w-full">
                          <Loader
                            className="h-[36px] w-[100px]"
                            isLoading={basLabelAttributesStatus === 'pending'}
                          >
                            <InputText
                              className="w-full border-0 border-b border-gray-300 ring-0"
                              placeholder="Agent Name"
                              name={attributeMeta.name}
                              onChange={event => {
                                setAttLabels(prev => {
                                  return {
                                    ...prev,
                                    [attributeMeta.name]: event.target.value,
                                  };
                                });
                              }}
                              value={attLabels[attributeMeta.name] || ''}
                            />
                          </Loader>
                        </div>

                        <Link
                          className="mb-1 mt-auto text-xs"
                          to={getAssetDrawerLink({
                            name: attributeMeta.name,
                            dns: attributeMeta.name,
                          })}
                        >
                          {attributeMeta.name.split('-')[0]}
                        </Link>
                      </div>
                      <div className="ml-3 flex shrink-0 border-l border-gray-200 bg-gray-50 py-2 ">
                        {Object.values(systemTypes).map((system, index) => {
                          const malwareAvailable =
                            malwareMap[
                              `malware/${attributeMeta.name}-${system}`
                            ];

                          function handleCopy() {
                            const filename =
                              system === 'windows' ? 'agent.ps1' : 'agent.sh';
                            copyToClipboard(
                              `curl -o ${filename} https://preview.chariot.praetorian.com/${friend.email || me}/${attributeMeta.name}/${system}`
                            );
                          }

                          return (
                            <Tooltip
                              title={
                                malwareAvailable
                                  ? `Copy ${system} command`
                                  : 'Upload TTP Binary to copy executable command'
                              }
                              key={index}
                            >
                              <img
                                onClick={
                                  malwareAvailable ? handleCopy : undefined
                                }
                                className={cn(
                                  'm-1 size-[28px] cursor-pointer p-1',
                                  malwareAvailable
                                    ? ''
                                    : 'cursor-not-allowed opacity-20'
                                )}
                                src={`/icons/${system}.svg`}
                              />
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </Loader>
          </div>
        </div>
      )}
    </form>
  );
}
