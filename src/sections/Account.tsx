import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import MD5 from 'crypto-js/md5';
import { TrashIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Dropzone, Files } from '@/components/Dropzone';
import { Paper } from '@/components/Paper';
import { useModifyAccount } from '@/hooks/useAccounts';
import { useMy } from '@/hooks/useMy';
import { useAuth } from '@/state/auth';

import { CollaboratingWith } from './CollaboratingWith';
import { Users } from './Users';
import { Loader } from '@/components/Loader';
import { useUploadFile, useGetFileSignedURL } from '@/hooks/useFiles';
import Hexagon from '@/components/Hexagon';

const Account: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [logoFilename, setLogoFilename] = useState('');
  const [logoURL, setLogoURL] = useState('');

  const { me, friend } = useAuth();
  const { data, status } = useMy({ resource: 'account' });
  const { mutate: updateAccount } = useModifyAccount('updateSetting');
  const account = useMemo(
    () => data?.find(acc => acc.key.endsWith('#settings#')),
    [data]
  );
  const accountDisplayName = account?.config?.displayName || '';
  const isDirty = status === 'success' && accountDisplayName !== displayName;
  const header = MD5(friend.email || me).toString();

  useEffect(() => {
    if (status === 'success') {
      setDisplayName((account?.config?.displayName as string) || '');
      if (account?.config?.logoFilename) {
        setLogoFilename(account.config.logoFilename as string);
        useGetFileSignedURL({
          name: account.config.logoFilename as string,
        }).then(signedURL => {
          setLogoURL(signedURL);
        });
      }
    }
  }, [status, account, logoURL]);

  const collaborators = useMemo(
    () =>
      data
        ?.filter(
          acc =>
            !acc.key.endsWith('#settings#') && acc?.member === acc?.username
        )
        .map(acc => ({
          email: acc.name,
          displayName: acc?.config?.displayName ?? acc.name,
        })),
    [data]
  );

  const { mutate: uploadFile } = useUploadFile();

  const handleFileDrop = (files: Files): void => {
    files.forEach(({ content, file }) => {
      uploadFile({
        name: file.name,
        content,
      });
      setLogoFilename(file.name);
      updateAccount({
        username: 'settings',
        config: { displayName, logoFilename: file.name },
      });
    });
  };

  return (
    <div className="flex h-max w-full flex-col gap-8">
      <Section title="Organization Details">
        <form
          onSubmit={e => {
            e.preventDefault();
            updateAccount({
              username: 'settings',
              config: { displayName, logoFilename },
            });
          }}
        >
          <Input
            label="Organization Name"
            value={displayName}
            name="displayName"
            isLoading={status === 'pending'}
            onChange={e => setDisplayName(e.target.value)}
          />

          <div className="mt-5 flex items-center gap-1">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Organization Logo
            </label>
          </div>
          <Loader isLoading={status === 'pending'} className="h-5 mt-2">
            {!account?.config?.logoFilename && (
              <Dropzone
                onFilesDrop={handleFileDrop}
                title="Click or drag and drop your logo image here."
                subTitle=""
                maxFileSizeInMb={6}
              />
            )}
            {account?.config?.logoFilename && (
              <div>
                <Hexagon big={true}>
                  <img className="object-scale-down h-50 w-50" src={logoURL} />
                </Hexagon>
                <Button
                  styleType="none"
                  onClick={() =>
                    updateAccount({
                      username: 'settings',
                      config: { displayName, logoFilename: '' },
                    })
                  }
                >
                  <TrashIcon className="size-10" />
                </Button>
              </div>
            )}
          </Loader>
          <Button
            style={{
              opacity: isDirty ? '100%' : '0%',
              visibility: isDirty ? 'visible' : 'hidden',
              transition: 'opacity 0.1s',
            }}
            className="mt-2"
            type="submit"
            styleType="primary"
          >
            Save
          </Button>
        </form>
      </Section>

      <Section
        title="Authorized Users"
        description="These individuals are allowed to see the data in your Praetorian
            account."
      >
        <Users />
      </Section>
      {/* Regarding `friend.length === 0`: This is a hack to avoid nested impersonation */}
      {/* It's a temporary solution until a better approach is implemented */}
      {collaborators &&
        collaborators.length > 0 &&
        friend.email.length === 0 && (
          <Section
            title="Collaborating With"
            description={
              <p>
                These organizations have invited you to view their account
                details. You are currently viewing <strong>open</strong> risks.
              </p>
            }
          >
            <CollaboratingWith emails={collaborators} />
          </Section>
        )}
      <Section
        title="Whitelisting Details"
        description="We have different methods of whitelisting our service so we can scan your network without being blocked by your security measures."
      >
        <div>
          <div className="pb-2 text-sm text-default-light">
            Every scan will have a unique header of:
          </div>
          <div className="block rounded-[2px] bg-default-light p-4 font-mono font-medium text-default-light">
            Chariot: {header}
          </div>
        </div>
      </Section>
    </div>
  );
};

interface SectionProps extends PropsWithChildren {
  title: string;
  description?: string | JSX.Element;
}

const Section = ({ title, description, children }: SectionProps) => {
  return (
    <Paper className="flex gap-28 p-8">
      <div className="w-[260px] shrink-0">
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="text-sm text-default-light">{description}</p>
      </div>
      <div className="h-max w-full">{children}</div>
    </Paper>
  );
};

export default Account;
