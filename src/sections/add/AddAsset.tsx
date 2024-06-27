import { useState } from 'react';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useCreateAsset } from '@/hooks/useAssets';
import { useGlobalState } from '@/state/global.state';

export function AddAsset() {
  const {
    modal: {
      asset: { open, onOpenChange },
    },
  } = useGlobalState();
  const [formData, setFormData] = useState({
    asset: '',
  });

  const { mutateAsync: createAsset, status: creatingAsset } = useCreateAsset();

  function onClose() {
    onOpenChange(false);
  }

  return (
    <Modal title="Add Asset" open={open} onClose={onClose} size="lg">
      <div className="flex flex-col space-y-4 p-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            What is an Asset?
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {`An asset refers to any single component of your organization's IT infrastructure that could be a target for cyberattacks. Assets are the actual items we assess for risks.`}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          For example, if you work for Acme Corporation, your assets might
          include:
          <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
            <li>
              Network Assets: <code>8.8.8.8</code>
            </li>
            <li>
              Host Assets: <code>server1.acme.com</code>,{' '}
              <code>workstation5.acme.com</code>
            </li>
            <li>
              Application Assets: <code>app.acme.com</code>
            </li>
            <li>
              Data Assets: <code>db.acme.com</code>
            </li>
            <li>
              Cloud Assets:{' '}
              <code>ec2-203-0-113-25.compute-1.amazonaws.com</code>
            </li>
          </ul>
        </p>

        <p className="mt-1 text-sm text-gray-500">
          We will monitor these assets, identify risks, and provide insights to
          enhance your security.
        </p>

        <form
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createAsset({ name: formData.asset });
            onClose();
          }}
        >
          <Inputs
            inputs={[
              {
                label: '',
                value: formData.asset,
                placeholder: 'acme.com',
                name: 'asset',
                required: true,
                className: 'h-11',
              },
            ]}
            onChange={values =>
              setFormData(formData => ({ ...formData, ...values }))
            }
          />
          <Button
            styleType="primary"
            type="submit"
            isLoading={creatingAsset === 'pending'}
          >
            Add Asset
          </Button>
          <div className="mt-0 text-center text-xs text-gray-500">
            Please ensure you have the necessary permissions to scan the seeds
            you are adding.
          </div>
        </form>
      </div>
    </Modal>
  );
}
