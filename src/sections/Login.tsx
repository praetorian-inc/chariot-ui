import React, { useCallback, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { ConfigIniParser } from 'config-ini-parser';

import { Button } from '@/components/Button';
import BackendSelector from '@/components/ui/BackendSelector';
import { useBackends } from '@/hooks';
import { useAuth } from '@/state/auth';
import { BackendType } from '@/types';
import { getRoute } from '@/utils/route.util';
import { LockClosedIcon } from '@heroicons/react/24/solid';

function Login() {
  const navigate = useNavigate();
  const { data: backends } = useBackends();
  const { login, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configIniParser = new ConfigIniParser();

  useMemo(() => {
    if (token) {
      return navigate(getRoute(['app']));
    }
  }, [token]);

  const handleSubmit = (backend: string) => {
    const selectedBackend = backends?.[backend];
    if (selectedBackend) {
      login(selectedBackend);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const config = configIniParser.parse(e?.target?.result as string);
      const sections = config.sections();

      if (sections.length > 0) {
        const backend = sections.shift() ?? '';

        const creds: BackendType = {
          name: config.get(backend, 'name').trim() as string,
          client_id: config.get(backend, 'client_id').trim() as string,
          api: config.get(backend, 'api').trim() as string,
        };

        if (
          config.isHaveOption(backend, 'username') &&
          config.isHaveOption(backend, 'password')
        ) {
          creds.username = config.get(backend, 'username').trim() as string;
          creds.password = config.get(backend, 'password').trim() as string;
        }

        login(creds);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      processFile(acceptedFiles[0]);
    },
    [backends, login]
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({ onDrop });

  const dropzoneProps = {
    ...getRootProps(),
    onClick: (event: React.MouseEvent) => {
      // Prevent the default file dialog from opening on click
      event.stopPropagation();
    },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-layer2 font-sans">
      <div
        {...dropzoneProps}
        className={`w-full max-w-md ${isDragAccept ? 'border-2 border-dashed bg-layer2' : 'bg-white'} border border-default rounded`}
      >
        <input {...getInputProps()} />
        <img
          src="/icons/header.png"
          alt="Chariot logo"
          className="w-full rounded-t"
        />
        <div className="p-8">
          <BackendSelector />
          <Button
            className="mt-4 w-full bg-brand py-4 text-white rounded text-xl"
            onClick={() => handleSubmit('United States')}
          >
            <LockClosedIcon className="w-6 h-6 mr-1 text-brand-light" />
            <p>Enter</p>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={event => {
              if (event.target.files) {
                processFile(event.target.files[0]);
              }
            }}
          />
          <p className="mt-8 text-center text-gray-500 text-sm">
            Free Registration Available
          </p>
          <p className="w-[400px] text-center text-gray-500 text-xs">
            By logging in, you agree to perform scans only on assets you own.
          </p>
          <p className="mt-6 w-[400px] text-center text-gray-500">
            Continuous Threat Exposure Management
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
