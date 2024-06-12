import { useMy } from '@/hooks';
import { useAuth } from '@/state/auth';
import { getChariotWebhookURL } from '@/utils/integration.util';

import { CopyToClipboard } from '../CopyToClipboard';

interface Props {
  defaultPin: string;
}
const WebhookExample: React.FC<Props> = ({ defaultPin }) => {
  const { me, api } = useAuth();
  const { data: accounts } = useMy({ resource: 'account' });
  const pin =
    accounts?.find(account => account.member === 'hook')?.config?.pin ??
    defaultPin;
  const url = getChariotWebhookURL({ api, me, pin });

  const samples = [
    {
      id: 'Asset',
      payload: `{
  "dns": "staging.domain.com",
  "name": "10.1.1.5",
}`,
    },
    {
      id: 'Risk',
      payload: `{
  "dns": "public-facing-api.domain.com",
  "name": "192.168.15.30",
  "finding": "exposed-administration-interface" # must match regex /^\\S+$/
}`,
    },
  ];

  return (
    <div>
      <p className="block text-sm font-medium leading-6 text-gray-900">
        Webhook URL
      </p>
      <p className="mb-4 break-all text-xs">
        <CopyToClipboard textToCopy={url}>{url}</CopyToClipboard>
      </p>
      {samples.map(sample => (
        <div key={sample.id} className="mb-6">
          <span className="block text-sm font-medium leading-6 text-gray-900">
            {sample.id} Payload Example
          </span>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 text-xs">
            {sample.payload}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default WebhookExample;
