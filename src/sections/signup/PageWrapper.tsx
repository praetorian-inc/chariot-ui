import { PropsWithChildren, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ConfigIniParser } from 'config-ini-parser';
import { toast } from 'sonner';

import { AwsCloudformation } from '@/components/icons/AwsCloudformation';
import { useBackends } from '@/hooks';
import { CustomerQuote } from '@/sections/signup/CustomerQuote';
import { emptyAuth, useAuth } from '@/state/auth';
import { BackendStack } from '@/types';

interface Props extends PropsWithChildren {
  title: string;
  description?: string;
}

export const PageWrapper = ({
  title = 'Sign in with your email and password',
  description = '',
  children,
}: Props) => {
  const configIniParser = new ConfigIniParser();
  const { data: backends } = useBackends();
  const { login, setBackendStack, backend } = useAuth();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      try {
        processFile(acceptedFiles[0]);
      } catch (error) {
        console.error('Error parsing file', error);
      }
    },
    [backends, login]
  );

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const config = configIniParser.parse(e?.target?.result as string);
        const sections = config.sections();

        if (sections.length > 0) {
          const backend = sections.shift() ?? '';

          const creds: BackendStack = {
            backend: config.get(backend, 'name').trim() as string,
            clientId: config.get(backend, 'client_id').trim() as string,
            api: config.get(backend, 'api').trim() as string,
            userPoolId: config.get(backend, 'user_pool_id').trim() as string,
          };

          setBackendStack(creds);

          if (
            config.isHaveOption(backend, 'username') &&
            config.isHaveOption(backend, 'password')
          ) {
            const username = config.get(backend, 'username').trim() as string;
            const password = config.get(backend, 'password').trim() as string;

            login(username, password);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message) {
          toast.error('Invalid keychain format');
        }
      }
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({ onDrop });

  const dropzoneProps = {
    ...getRootProps(),
    onClick: (event: React.MouseEvent) => {
      // Prevent the default file dialog from opening on click
      event.stopPropagation();
    },
  };

  return (
    <div className="flex size-full bg-layer0">
      <div
        className={`basis-full space-y-8 overflow-auto ${isDragAccept ? 'border-2 border-dashed bg-layer2' : 'bg-white'} p-8 md:basis-1/2 md:p-16 xl:basis-2/5`}
        {...dropzoneProps}
      >
        <input {...getInputProps()} />
        <img
          className="w-24"
          src="/icons/praetorian.png"
          alt="Praetorian Logo"
        />
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm">{description}</p>
        {backend !== emptyAuth.backend && (
          <div className="flex items-center gap-2 rounded bg-brand-lighter p-2 text-sm text-brand">
            <AwsCloudformation className="inline size-6" />
            <span className="font-semibold">{`Stack : ${backend}`}</span>
            <XMarkIcon
              className="ml-auto size-5 cursor-pointer rounded-full bg-layer0"
              onClick={() => setBackendStack()}
            />
          </div>
        )}
        {children}
      </div>
      <CustomerQuote />
    </div>
  );
};
