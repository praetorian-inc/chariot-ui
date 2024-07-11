import { useEffect, useMemo, useState } from 'react';

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

  const handleFormSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    link({
      username: `sso:${domain}`,
      value: `sso:${domain}`,
      config: {
        name: `sso:${domain}`,
        clientId: clientId,
        secret,
        issuerUrl,
      },
    });
    // Close the modal after submission
    setShowModal(false);
  };

  return (
    <>
      {ssoAccount ? (
        <Button
          onClick={() => unlink(ssoAccount)}
          className="border border-red-500 bg-red-50 text-red-600"
        >
          Disconnect
        </Button>
      ) : (
        <Button onClick={() => setShowModal(true)}>Setup</Button>
      )}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Setup SSO"
        size="md"
      >
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col space-y-4 p-4"
        >
          <p className="mb-6 text-xl font-semibold">
            Add your Okta or Azure AD details below to get started.
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Secret
            </label>
            <input
              type="text"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="mt-1 block w-full  border-gray-300 p-2 shadow-sm"
              required
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
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Button styleType="primary" type="submit" className="w-full">
              Enable SSO
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
