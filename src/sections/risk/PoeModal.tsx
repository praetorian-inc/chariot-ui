import { useMemo } from 'react';
import {
  CommandLineIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Editor } from '@monaco-editor/react';

import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { Snackbar } from '@/components/Snackbar';
import { NoData } from '@/components/ui/NoData';
import { useGetFile } from '@/hooks/useFiles';
import { useSearchParams } from '@/hooks/useSearchParams';
import { copyToClipboard } from '@/utils/copyToClipboard.util';
import { getDescription } from '@/utils/risk.util';
import { StorageKey } from '@/utils/storage/useStorage.util';

export function POEModal() {
  const { searchParams, removeSearchParams } = useSearchParams();
  const rawRiskComposite = searchParams.get(StorageKey.POE) ?? '';
  const riskComposite =
    rawRiskComposite && decodeURIComponent(rawRiskComposite);
  const isNoseyParker = riskComposite.startsWith('https://github');
  const [dns, name] = riskComposite ? riskComposite.split('/') : ['', ''];

  const { data: file, status: fileStatus } = useGetFile(
    {
      name: `${dns}/${name}`,
    },
    {
      enabled: Boolean(dns && name && !isNoseyParker),
    }
  );

  const proofOfExploit = useMemo(() => {
    return getDescription(file);
  }, [file]);

  return (
    <Modal
      title="Proof of Exploit"
      open={Boolean(riskComposite)}
      onClose={() => removeSearchParams(StorageKey.POE)}
      size="xl"
      className="h-[60vh]"
      footer={{
        left: (
          <div className="flex gap-2">
            {file?.['curl-command'] && (
              <Button
                styleType="secondary"
                startIcon={
                  <CommandLineIcon className="size-4 text-default-light" />
                }
                onClick={() => {
                  copyToClipboard(file['curl-command']);
                  Snackbar({
                    title: 'Copied Command',
                    variant: 'success',
                    description: '',
                  });
                }}
              >
                Copy Command
              </Button>
            )}
            <Button
              styleType="secondary"
              startIcon={
                <DocumentArrowDownIcon className="size-4 text-default-light" />
              }
              isLoading={fileStatus === 'pending' && !isNoseyParker}
              disabled={!proofOfExploit && !isNoseyParker}
              onClick={() => {
                if (isNoseyParker) {
                  copyToClipboard(riskComposite);
                } else {
                  copyToClipboard(String(proofOfExploit));
                }
                Snackbar({
                  title: 'Copied All',
                  variant: 'success',
                  description: '',
                });
              }}
            >
              Copy All
            </Button>
          </div>
        ),
      }}
    >
      <Loader
        isLoading={fileStatus === 'pending' && !isNoseyParker}
        type="spinner"
      >
        {!proofOfExploit || isNoseyParker ? (
          isNoseyParker ? (
            <a
              href={riskComposite}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor text-brand"
            >
              {riskComposite}
            </a>
          ) : (
            <NoData title="No Proof of exploit found." />
          )
        ) : null}
        {proofOfExploit && (
          <>
            {name === 'accepts-input' ? ( // assume https (port not provided)
              <UniqueLinkList inputString={proofOfExploit} />
            ) : (
              <Editor
                height="100%"
                language="yaml"
                value={proofOfExploit}
                options={{
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </>
        )}
      </Loader>
    </Modal>
  );
}

interface UniqueLinkListProps {
  inputString: string;
}

const UniqueLinkList: React.FC<UniqueLinkListProps> = ({ inputString }) => {
  // Convert the multiline string into an array, remove duplicates, and trim each line
  const uniqueLinks = Array.from(
    new Set(inputString.split('\n').map(line => line.trim()))
  );

  // Check if each line is non-empty and create the full URL
  const links = uniqueLinks.filter(line => line.trim());

  // Sort alphabetically
  links.sort();

  return (
    <div className="flex flex-col space-y-2">
      {links.map((link, index) => (
        <a
          key={index}
          href={link}
          className="text-brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link}
        </a>
      ))}
    </div>
  );
};
