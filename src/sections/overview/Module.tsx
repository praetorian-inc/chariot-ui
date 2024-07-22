import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Dropzone } from '@/components/Dropzone';
import { Input } from '@/components/form/Input';
import { InputText } from '@/components/form/InputText';
import { Loader } from '@/components/Loader';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { OverflowText } from '@/components/OverflowText';
import WebhookExample from '@/components/ui/WebhookExample';
import { useMy } from '@/hooks';
import { useBulkAddAsset } from '@/hooks/useAssets';
import { useBulkAddAttributes } from '@/hooks/useAttribute';
import { useCounts } from '@/hooks/useCounts';
import { useGenericSearch } from '@/hooks/useGenericSearch';
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
import { generateUuid } from '@/utils/uuid.util';

const nessusMarkdown = `
Use our open-source command line interface (CLI) to import assets and risks from Nessus scans.

1. Install the CLI using the following command:
    \`\`\`
    pip install praetorian-cli
    \`\`\`
2. Follow the instructions on our GitHub repo to configure the CLI:
    \`\`\`
    Visit: https://github.com/praetorian-inc/praetorian-cli
   \`\`\`
3. Run one of the following commands to import Nessus results:
    
    \`\`\`
    Using Nessus API: praetorian chariot plugin nessus-api
    Using Nessus XML export files: praetorian chariot plugin nessus-sml
    \`\`\`
`;

const defaultPin = (
  Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
).toString();
const uuid = generateUuid();

export const Integrations: Record<Integration, IntegrationMeta> = {
  kev: {
    id: Integration.kev,
    name: 'kev',
    description: '',
    logo: '/icons/kev.svg',
    connected: true,
    inputs: [],
    markup: (
      <div>
        Known Exploited Vulnerabilities - The Cybersecurity & Infrastructure
        Security Agency (CISA) maintains the knowledge on cybersecurity risks
        that are being exploited in the real world. Each Known Exploited Risk
        (KEV), moves a cybersecurity vulnerability from theoretical to
        practical. Chariot shows you whether your organization is susceptible to
        KEVs so that you can focus attention on protecting against attacks that
        are being used now.
      </div>
    ),
  },
  basAgent: {
    id: Integration.basAgent,
    name: 'Bas Agent',
    description: 'Create a bas agent.',
    logo: '/icons/PraetorianWebhook.svg',
    connected: true,
    inputs: [],
    customIntegration: <BasIntegration />,
  },
  hook: {
    id: Integration.hook,
    name: 'Chariot Webhook',
    description: 'Push assets and risks to Chariot.',
    logo: '/icons/PraetorianWebhook.svg',
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: true,
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
    connected: false,
    markup: <MarkdownPreview source={nessusMarkdown} />,
  },
  qualys: {
    id: Integration.qualys,
    name: 'Qualys',
    description:
      'Offers cloud-based solutions for security and compliance across networks.',
    logo: '/icons/Qualys.svg',
    connected: false,
  },
  zulip: {
    id: Integration.zulip,
    name: 'Zulip',
    description: 'Receive Zulip notifications when new risks are discovered.',
    logo: '/icons/Zulip.svg',
    connected: true,
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
    Icon: TrophyIcon,
    name: 'Project management',
    label: 'Integrate with your existing workflows',
    description: '',
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Project management</h3>
        <p className="mt-2 text-default-light">
          Project management integrations allow you to integrate with your
          existing workflows
        </p>
      </div>
    ),
    integrations: [
      Integrations.hook,
      Integrations.slack,
      Integrations.jira,
      Integrations.zulip,
    ],
  },
  ASM: {
    Icon: BeakerIcon,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization's IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Attack Surface Management</h3>
        <p className="mt-2 text-default-light">
          Gain visibility into your expanding attack surface through continuous
          discovery, identification, and monitoring of your evolving digital
          landscape.
        </p>
        <p className="mt-2 text-default-light">
          ASM helps you proactively manage potential vulnerabilities and
          exposures, ensuring your organization&apos;s security measures keep
          pace with the dynamic threat environment.
        </p>
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
    Icon: HomeIcon,
    label: 'Breach & Attack Simulation',
    name: 'BAS',
    description: `Breach and Attack Simulation (BAS) uses automated tools to continuously simulate real-world cyber attacks, helping organizations identify vulnerabilities, improve threat detection, and enhance their overall security posture.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Breach & Attack Simulation</h3>
        <p className="mt-2 text-default-light">
          BAS allows you to simulate real-world attack scenarios in a controlled
          environment, identifying vulnerabilities before attackers can exploit
          them.
        </p>
        <p className="mt-2 text-default-light">
          Enhance your threat detection and response capabilities by
          continuously testing your defenses against the latest attack
          techniques.
        </p>
      </div>
    ),
    integrations: [Integrations.basAgent],
  },
  CTI: {
    Icon: HomeIcon,
    label: 'Cyber Threat Intelligence',
    name: 'CTI',
    description: `Cyber Threat Intelligence (CTI) involves the collection and analysis of information about potential or current attacks that threaten an organization, helping to inform security decisions and proactive defense strategies.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Cyber Threat Intelligence</h3>
        <p className="mt-2 text-default-light">
          Chariot monitors emerging threats, providing detailed analysis of new
          vulnerabilities, exploits, and attack vectors from a variety of
          trusted sources.
        </p>
        <p className="mt-2 text-default-light">
          Empower your organization with actionable intelligence to anticipate,
          prepare for, and respond to evolving cyber threats.
        </p>
      </div>
    ),
    integrations: [Integrations.kev],
  },
  VM: {
    Icon: TrophyIcon,
    label: 'Vulnerability Management',
    name: 'VM',
    description: `Our Vulnerability Management (VM) services include identifying, assessing, and mitigating security vulnerabilities across your IT infrastructure to ensure robust protection against potential threats.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Vulnerability Management</h3>
        <p className="mt-2 text-default-light">
          VM services help you identify, prioritize, and remediate security
          vulnerabilities to protect your organization from potential threats.
        </p>
        <p className="mt-2 text-default-light">
          Enhance your security posture by proactively managing vulnerabilities
          across your IT infrastructure.
        </p>
      </div>
    ),
    integrations: [Integrations.nessus],
  },
  CPT: {
    Icon: TrophyIcon,
    label: 'Endpoint Detection and Response',
    name: 'CPT',
    description: `Endpoint Detection and Response (EDR) solutions provide continuous monitoring and response to advanced threats on endpoints, helping organizations detect and mitigate security incidents in real-time.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">
          Endpoint Detection and Response
        </h3>
        <p className="mt-2 text-default-light">
          EDR solutions offer comprehensive visibility into endpoint activities,
          enabling rapid detection and response to potential threats.
        </p>
        <p className="mt-2 text-default-light">
          Improve your security posture by leveraging advanced analytics and
          automated responses to mitigate risks effectively.
        </p>
      </div>
    ),
    integrations: [],
  },
};

export type IntegrationData = { isConnected: true; accounts: Account[] };

export type IntegrationsData = Record<Integration, IntegrationData>;

export function useGetModuleData(): {
  data: Record<
    Module,
    {
      noOfRisk: number;
      noOfAsset: number;
      enabled: boolean;
      assetAttributes: Attribute[];
      riskAttributes: Attribute[];
      isLoading: boolean;
    }
  >;
  integrationsData: IntegrationsData;
  isLoading: boolean;
} {
  const { data: assetCount, status: assetCountStatus } = useCounts({
    resource: 'asset',
  });
  const { data: riskCount, status: riskCountStatus } = useCounts({
    resource: 'risk',
  });

  const { data: cveRisksGenericSearch } = useGenericSearch({ query: 'CVE' });

  const { data: accounts, status: accountStatus } = useMy({
    resource: 'account',
  });
  const { data: basAttributes, status: basAttributesStatus } = useMy({
    resource: 'attribute',
    query: '#source#bas',
  });
  const { data: kevAttributes, status: ctiAttributeStatus } = useMy({
    resource: 'attribute',
    query: '#source#kev',
  });
  const { data: nessusAttributes, status: nessusAttributesStatus } = useMy({
    resource: 'attribute',
    query: '#source#nessus',
  });

  const basAssetAttribute = basAttributes.filter(({ source }) => {
    return source.startsWith('#asset');
  });
  const basRiskAttribute = basAttributes.filter(({ source }) => {
    return source.startsWith('#risk');
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
    },
    BAS: {
      noOfRisk: basRiskAttribute.length,
      noOfAsset: basAssetAttribute.length,
      enabled: isIntegrationsConnected(Module.BAS),
      assetAttributes: basAssetAttribute,
      riskAttributes: basRiskAttribute,
      isLoading: basAttributesStatus === 'pending',
    },
    CPT: {
      noOfRisk: 0,
      noOfAsset: 0,
      enabled: isIntegrationsConnected(Module.CPT),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: false,
    },
    CTI: {
      noOfRisk: ctiRiskAttribute.length,
      noOfAsset: ctiAssetAttribute.length,
      enabled: isIntegrationsConnected(Module.CTI),
      assetAttributes: ctiAssetAttribute,
      riskAttributes: ctiRiskAttribute,
      isLoading: ctiAttributeStatus === 'pending',
    },
    PM: {
      noOfRisk: 0,
      noOfAsset: 0,
      enabled: isIntegrationsConnected(Module.PM),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
    },
    VM: {
      noOfRisk: cveRisksGenericSearch?.risks?.length || 0,
      noOfAsset: 0,
      enabled: isIntegrationsConnected(Module.VM),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
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
  const {
    data: { BAS },
    isLoading,
  } = useGetModuleData();

  const { mutateAsync: createBulkAsset, status: createBulkAssetStatus } =
    useBulkAddAsset();

  const {
    mutateAsync: createBulkAttribute,
    status: createBulkAttributeStatus,
  } = useBulkAddAttributes();

  async function handleSubmit() {
    const basAgents = 10;

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

  const isEnabled = BAS.assetAttributes.length > 0;

  console.log('BAS', BAS.assetAttributes);
  return (
    <div className={cn('p-4')}>
      <div className="flex min-h-11 items-center gap-2">
        <h3 className="text-xl font-medium text-gray-700">Bas Agent</h3>
        {!isEnabled && (
          <Button
            isLoading={
              createBulkAssetStatus === 'pending' ||
              createBulkAttributeStatus === 'pending'
            }
            disabled={BAS.isLoading}
            styleType="text"
            className="ml-auto"
            onClick={handleSubmit}
          >
            Enable
          </Button>
        )}
      </div>
      <Dropzone onFilesDrop={() => {}} type="string" />
      <div className="flex flex-col gap-2 pt-4">
        <Loader isLoading={isLoading}>
          {BAS.assetAttributes
            .sort((a, b) => {
              const bDate = new Date(b.updated);
              const aDate = new Date(a.updated);

              return bDate.getTime() - aDate.getTime();
            })
            .map((attribute, index) => {
              return (
                <div className="flex gap-2" key={index}>
                  <InputText
                    className="w-[100px]"
                    name={`bas-asset-${index}`}
                    onChange={() => {}}
                    value={''}
                  />
                  <CopyToClipboard className="w-full overflow-hidden">
                    <OverflowText
                      text={attribute.key.split('#')[6]}
                      className="mr-1 text-nowrap font-medium text-brand"
                    />
                  </CopyToClipboard>
                </div>
              );
            })}
        </Loader>
      </div>
    </div>
  );
}
