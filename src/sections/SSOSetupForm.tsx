import { useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/form/Input';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useMy } from '@/hooks';
import { useModifyAccount } from '@/hooks/useAccounts';

const DefaultFormValues = {
  domain: '',
  clientId: '',
  secret: '',
  issuerUrl: '',
};

export const SSOSetupForm = () => {
  const { data: accounts } = useMy({ resource: 'account' });
  const { mutate: link } = useModifyAccount('link');
  const { mutate: unlink } = useModifyAccount('unlink');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(DefaultFormValues);

  const ssoAccount = useMemo(
    () => accounts?.find(account => account.member.startsWith('sso:')),
    [accounts]
  );

  const handleFormSubmit = () => {
    const { domain, clientId, secret, issuerUrl } = formData;
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
    setFormData(DefaultFormValues);
  };

  return (
    <>
      {ssoAccount ? (
        <div className="mt-2 flex flex-row space-x-6">
          <Chip className="text-md px-6" style="primary">
            {ssoAccount.member.split(':')[1]}
          </Chip>
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
          form: 'sso-setup-form',
          text: 'Save',
        }}
      >
        <form
          className="flex flex-col space-y-4"
          id="sso-setup-form"
          onSubmit={handleFormSubmit}
        >
          <p className="text-sm font-bold">
            Add a TXT record to your domain with the following value:{' '}
            <code>chariot=&lt;email&gt;</code>
          </p>
          <Inputs
            inputs={[
              {
                label: 'Domain',
                value: formData.domain,
                placeholder: 'acme.com',
                name: 'domain',
                required: true,
              },
              {
                label: 'Client ID',
                value: formData.clientId,
                placeholder: '1a2b3c4d-5e6f-7g8h-9i0j',
                name: 'clientId',
                required: true,
              },
              {
                label: 'Secret',
                value: formData.secret,
                type: Input.Type.PASSWORD,
                placeholder: '**********',
                name: 'secret',
                required: true,
              },
              {
                label: 'Issuer URL',
                value: formData.issuerUrl,
                placeholder:
                  'https://login.microsoftonline.com/1a2b3c4d-5e6f-7g8h-9i0j/v2.0',
                name: 'issuerUrl',
                required: true,
              },
            ]}
            onChange={values =>
              setFormData(formData => ({ ...formData, ...values }))
            }
          />
        </form>
      </Modal>
    </>
  );
};
