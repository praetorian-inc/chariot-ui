import { useMemo, useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Input } from '@/components/form/Input';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useModifyAccount, useMy } from '@/hooks';
import { useAuth } from '@/state/auth';

const DefaultFormValues = {
  domain: '',
  clientId: '',
  secret: '',
  issuerUrl: '',
};

export const SSOSetupForm = () => {
  const { me, friend } = useAuth();
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
            className="flex flex-row items-center justify-center space-x-2 text-sm font-medium"
            onClick={() =>
              unlink({ ...ssoAccount, username: ssoAccount.member })
            }
          >
            <XMarkIcon className="size-5" />
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
          <div className="rounded-lg bg-gray-100 p-4">
            <p className="mb-2 text-sm font-bold">Need help?</p>
            <div className="flex flex-col space-y-2">
              <a
                href="https://docs.praetorian.com/hc/en-us/articles/27430843438619-Okta-SSO-Configuration"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline"
              >
                <InformationCircleIcon className="size-5" />
                <span>How to: Okta SSO Configuration</span>
              </a>
              <a
                href="https://docs.praetorian.com/hc/en-us/articles/27451961594139-Azure-SSO-Configuration"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline"
              >
                <InformationCircleIcon className="size-5" />
                <span>How to: Azure SSO Configuration</span>
              </a>
            </div>
          </div>
          <p className="text-sm font-bold">
            Add a TXT record to your domain with the following value:{' '}
            <code className="prose block overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-4 text-xs text-default">
              <CopyToClipboard>{`chariot=${friend || me}`}</CopyToClipboard>
            </code>
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
