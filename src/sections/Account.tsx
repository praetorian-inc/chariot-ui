import React, { PropsWithChildren, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import MD5 from 'crypto-js/md5';

import { Button } from '@/components/Button';
import { Dropzone, Files } from '@/components/Dropzone';
import { Input } from '@/components/form/Input';
import { Loader } from '@/components/Loader';
import { Paper } from '@/components/Paper';
import {
  PROFILE_PICTURE_ID,
  useGetProfilePictureUrl,
} from '@/hooks/profilePicture';
import {
  useGetCollaboratorEmails,
  useGetDisplayName,
  useModifyAccount,
} from '@/hooks/useAccounts';
import { useUploadFile } from '@/hooks/useFiles';
import { useMy } from '@/hooks/useMy';
import { CollaboratingWith } from '@/sections/CollaboratingWith';
import Avatar from '@/sections/topNavBar/Avatar';
import { Users } from '@/sections/Users';
import { useAuth } from '@/state/auth';

const Account: React.FC = () => {
  const [displayName, setDisplayName] = useState('');

  const { me, friend } = useAuth();
  const { data, status } = useMy({ resource: 'account' });
  const { mutate: updateAccount } = useModifyAccount('updateSetting');
  const accountDisplayName = useGetDisplayName(data);
  const isDirty = status === 'success' && accountDisplayName !== displayName;
  const header = MD5(friend.email || me).toString();

  useEffect(() => {
    if (status === 'success') {
      setDisplayName(accountDisplayName);
    }
  }, [status, accountDisplayName]);

  const collaborators = useGetCollaboratorEmails(data);

  const { mutate: uploadFile } = useUploadFile();

  const { data: profilePicture, status: profilePictureStatus } =
    useGetProfilePictureUrl(
      { email: friend.email || me },
      { enabled: !friend.email }
    );

  const handleFileDrop = (files: Files<'arrayBuffer'>): void => {
    if (files.length === 1) {
      const content = files[0].content;

      uploadFile({
        name: PROFILE_PICTURE_ID,
        content,
      });
    }
  };

  const showDpDropzone = !profilePicture || profilePicture.isGavatar;

  return (
    <div className="flex h-max w-full flex-col gap-8">
      <Section title="Organization Details">
        <form
          onSubmit={e => {
            e.preventDefault();
            updateAccount({
              username: 'settings',
              config: { displayName },
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

          <>
            <div className="mt-5 flex items-center">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Organization Logo
              </label>
            </div>
            <Loader
              isLoading={profilePictureStatus === 'pending'}
              className="h-5 m-0"
            >
              {showDpDropzone && (
                <Dropzone
                  type="arrayBuffer"
                  onFilesDrop={handleFileDrop}
                  title="Click or drag and drop your logo image here."
                  subTitle=""
                  maxFileSizeInMb={6}
                  className="mt-1"
                />
              )}
              {!showDpDropzone && (
                <div className="flex flex-row items-center">
                  <Avatar className="mr-2 size-20" email={friend.email || me} />

                  <Button
                    styleType="text"
                    onClick={() => {
                      uploadFile({
                        name: PROFILE_PICTURE_ID,
                        content: '',
                      });
                    }}
                  >
                    <XMarkIcon className="size-3" /> Remove
                  </Button>
                </div>
              )}
            </Loader>
          </>

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
            <CollaboratingWith />
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
