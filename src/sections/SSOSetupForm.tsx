import { useState } from 'react';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';

export const SSOSetupForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [domain, setDomain] = useState('');
  const [clientId, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [issuerUrl, setIssuerUrl] = useState('');

  const handleFormSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      domain: `sso:${domain}`,
      clientId,
      secret,
      issuerUrl,
    });
    // Close the modal after submission
    setShowModal(false);
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Setup</Button>
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
