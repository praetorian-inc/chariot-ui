import { v4 as uuidv4 } from 'uuid';

import { Input } from '@/components/form/Input';
import { InputsT } from '@/components/form/Inputs';
import AWSExample from '@/components/ui/AWSExample';
import WebhookExample from '@/components/ui/WebhookExample';
import { IntegrationType } from '@/types';
import { getChariotWebhookURL } from '@/utils/integration.util';

export interface IntegrationMeta {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  logo?: string;
  connected: boolean;
  types?: IntegrationType[];
  issue?: number;
  inputs?: InputsT;
  warning?: string;
  message?: JSX.Element;
  markup?: JSX.Element;
  multiple?: boolean;
  copy?: {
    value: ({
      api,
      me,
      config,
    }: {
      api: string;
      me: string;
      config: {
        pin: string;
      };
    }) => string;
    tooltip?: string;
  };
}

const uuid = uuidv4();

const defaultPin = (
  Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
).toString();
export const IntegrationsMeta: IntegrationMeta[] = [
  {
    id: 12,
    name: 'hook',
    displayName: 'Chariot Webhook',
    description:
      'Receive streaming events when new assets and risks are discovered',
    logo: '/icons/PraetorianWebhook.svg',
    connected: true,
    types: [IntegrationType.Workflow],
    copy: {
      value: ({
        api,
        me,
        config,
      }: {
        api: string;
        me: string;
        config: { pin: string };
      }) => {
        return getChariotWebhookURL({ api, me, pin: config.pin });
      },
      tooltip: 'Copy webhook URL',
    },
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
  {
    id: 9,
    name: 'slack',
    displayName: 'Slack',
    description: 'Receive Slack notifications when new risks are discovered',
    logo: '/icons/Slack.svg',
    connected: true,
    types: [IntegrationType.Workflow],
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
  {
    id: 10,
    name: 'jira',
    displayName: 'Atlassian Jira',
    description:
      'Track and manage risks directly within your connected Jira project',
    logo: '/icons/Jira.svg',
    connected: true,
    types: [IntegrationType.Workflow],
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
  {
    id: 7,
    name: 'github',
    displayName: 'GitHub',
    description:
      "Discover your GitHub organization's repositories and identify risks",
    logo: '/icons/GitHub.svg',
    connected: true,
    multiple: true,
    types: [IntegrationType.AssetDiscovery, IntegrationType.RiskIdentification],
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
  {
    id: 4,
    name: 'amazon',
    displayName: 'Amazon Web Services',
    description: 'Discover and scan assets hosted within your AWS organization',
    logo: '/icons/AWS.svg',
    connected: true,
    types: [IntegrationType.AssetDiscovery],
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
    message: <AWSExample />,
  },
  {
    id: 8,
    name: 'ns1',
    displayName: 'NS1',
    description: 'Discover and scan assets managed within your NS1 tenant',
    logo: '/icons/NS1.svg',
    connected: true,
    types: [IntegrationType.AssetDiscovery],
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
  {
    id: 5,
    name: 'gcp',
    displayName: 'Google Cloud',
    description: 'Discover and scan assets hosted within your GCP organization',
    logo: '/icons/GoogleCloud.svg',
    connected: true,
    types: [IntegrationType.AssetDiscovery],
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
  {
    id: 6,
    name: 'azure',
    displayName: 'Azure',
    description:
      'Discover and scan assets hosted within your Azure organization',
    logo: '/icons/Azure.svg',
    connected: true,
    types: [IntegrationType.AssetDiscovery],
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
  {
    id: 16,
    name: 'crowdstrike',
    displayName: 'CrowdStrike',
    description:
      'Import your assets from CrowdStrike and identify policy risks',
    logo: '/icons/Crowdstrike.svg',
    connected: true,
    types: [IntegrationType.AssetDiscovery, IntegrationType.RiskIdentification],
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
  {
    id: 14,
    name: 'gitlab',
    displayName: 'GitLab',
    description:
      "Discover your GitLab organization's repositories and identify risks",
    logo: '/icons/GitLab.svg',
    connected: true,
    multiple: true,
    types: [IntegrationType.AssetDiscovery, IntegrationType.RiskIdentification],
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
  {
    id: 13,
    name: 'nessus',
    displayName: 'Nessus Tenable',
    description:
      'Industry-standard vulnerability scanner for comprehensive security assessments.',
    logo: '/icons/Nessus.svg',
    connected: false,
    types: [IntegrationType.RiskIdentification],
  },
  {
    id: 15,
    name: 'qualys',
    displayName: 'Qualys',
    description:
      'Offers cloud-based solutions for security and compliance across networks.',
    logo: '/icons/Qualys.svg',
    connected: false,
    types: [IntegrationType.RiskIdentification],
  },
];

export const AccountMeta: IntegrationMeta = {
  id: 0,
  name: 'account',
  displayName: 'Link Account',
  connected: true,
  warning: 'This will grant them full access to your account.',
  inputs: [
    {
      label: 'Email Address',
      value: '',
      placeholder: 'email@domain.com',
      name: 'username',
      required: true,
      hidden: false,
    },
  ],
};

export const AvailableIntegrations = IntegrationsMeta.filter(
  integration => integration.connected
).map(integration => integration.name);

export const isComingSoonIntegration = (name: string) =>
  !AvailableIntegrations.includes(name);

export const getIntegrationMeta = (name?: string) =>
  name
    ? IntegrationsMeta.find(integration => integration.name === name)
    : undefined;
