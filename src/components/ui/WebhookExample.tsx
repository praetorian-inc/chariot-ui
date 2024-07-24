import { CopyToClipboard } from '@/components/CopyToClipboard';
import { useMy } from '@/hooks';
import { useAuth } from '@/state/auth';
import { getChariotWebhookURL } from '@/utils/integration.util';

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
      comment: (
        <p>
          Finding is a regex pattern that matches{' '}
          <pre className="inline rounded-[2px] bg-gray-200 p-1 text-xs text-default">
            {`/^\\S+$/`}
          </pre>
        </p>
      ),
      payload: `{  
  "dns": "public-facing-api.domain.com",
  "name": "192.168.15.30",
  "finding": "exposed-administration-interface",
  "source": "webhook" # optional source of the risk, like 'nessus' or 'qualys'
}`,
    },
  ];

  return (
    <div>
      <p className="block text-sm font-medium leading-6 text-gray-900">
        Webhook URL
      </p>
      <CopyToClipboard textToCopy={url}>
        <p className="text-sm">{url}</p>
      </CopyToClipboard>
      {samples.map(sample => (
        <div key={sample.id} className="mt-4 ">
          <p className="pb-1 text-sm font-medium">
            {sample.id} Payload Example
          </p>
          <code className="prose block overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-4 text-xs text-default">
            {sample.payload}
          </code>
        </div>
      ))}
    </div>
  );
};

export default WebhookExample;
