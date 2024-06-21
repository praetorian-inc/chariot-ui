import React, { useEffect, useMemo, useState } from 'react';
import { UserIcon } from '@heroicons/react/24/solid';

import { useAuth } from '@/state/auth';
import { useMy } from '@/hooks';
import { useGetFileSignedURL } from '@/hooks/useFiles';

async function computeSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

interface Props {
  account?: string;
  className?: string;
  logoFilename?: string;
}

const Avatar: React.FC<Props> = ({
  account,
  className,
  logoFilename,
}: Props) => {
  const { me, token } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const { data } = useMy({ resource: 'account' });
  const settings = useMemo(
    () => data?.find(acc => acc.key.endsWith('#settings#')),
    [data]
  );

  useEffect(() => {
    if (account || me) {
      if (settings?.config?.logoFilename) {
        useGetFileSignedURL({
          name: settings.config.logoFilename as string,
        }).then(signedURL => {
          setLogoUrl(signedURL);
        });
      }
    }
  }, [account, me, logoUrl, settings]);

  return (
    <>
      {logoUrl && !loadError ? (
        <img
          src={logoUrl}
          onError={() => setLoadError(true)}
          alt="User Avatar"
          className={className}
        />
      ) : (
        <div className="relative flex items-center justify-center rounded-[2px] text-sm font-medium text-default-light ring-inset focus:z-10 focus:outline-0 disabled:cursor-not-allowed disabled:bg-default-light disabled:text-default-light">
          <UserIcon className="size-5 text-lg" />
        </div>
      )}
    </>
  );
};

export default Avatar;
