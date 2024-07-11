import { useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useMy } from '@/hooks';
import { useModifyAccount } from '@/hooks/useAccounts';

export const SSOSetupForm = () => {
  const { data: accounts, refetch } = useMy({ resource: 'account' });
  const { mutate: link, status } = useModifyAccount('link');
  const { mutate: unlink } = useModifyAccount('unlink');

  const [showModal, setShowModal] = useState(false);
  const [domain, setDomain] = useState('');
  const [clientId, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [issuerUrl, setIssuerUrl] = useState('');

  const ssoAccount = useMemo(
    () => accounts?.find(account => account.member.startsWith('sso:')),
    [accounts]
  );

  useEffect(() => {
    if (status === 'success') {
      refetch();
    }
  }, [status]);

  const handleFormSubmit = () => {
    link({
      username: `sso:${domain}`,
      value: `sso:${domain}`,
      config: {
        name: `sso:${domain}`,
        id: clientId,
        secret,
        issuer: issuerUrl,
      },
    });
    // Close the modal after submission
    setShowModal(false);
  };

  return (
    <>
      {ssoAccount ? (
        <div className="flex flex-row space-x-6">
          <span>{ssoAccount.member.split(':')[1]}</span>
          <button
            className="jusify-center flex flex-row items-center space-x-2 text-sm font-medium"
            onClick={() =>
              unlink({ ...ssoAccount, username: ssoAccount.member })
            }
          >
            <XMarkIcon className="size-3" />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <Button onClick={() => setShowModal(true)}>Setup</Button>
      )}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Setup SSO"
        size="md"
        footer={{
          text: 'Save',
          onClick: handleFormSubmit,
        }}
      >
        <form className="flex flex-col space-y-4 p-4">
          <p className="mb-6 ">
            Add a TXT record to your domain with the following value:{' '}
            <code>chariot=&lt;email&gt;</code>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="mt-1 block w-full  border-gray-300 p-2 shadow-sm"
              required
              placeholder="acme.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="mt-1 block w-full  border-gray-300 p-2 shadow-sm"
              required
              placeholder="1a2b3c4d-5e6f-7g8h-9i0j"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="mt-1 block w-full  border-gray-300 p-2 shadow-sm"
              required
              placeholder="**********"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Issuer URL
            </label>
            <input
              type="text"
              value={issuerUrl}
              onChange={e => setIssuerUrl(e.target.value)}
              className="mt-1 block w-full  border-gray-300 p-2 shadow-sm"
              required
              placeholder="https://login.microsoftonline.com/1a2b3c4d-5e6f-7g8h-9i0j/v2.0"
            />
          </div>
        </form>
      </Modal>
    </>
  );
};
