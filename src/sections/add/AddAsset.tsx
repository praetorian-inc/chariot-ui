import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/form/Input';
import { Inputs, Values } from '@/components/form/Inputs';
import { AssetsIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { useCreateAsset } from '@/hooks/useAssets';
import { useGlobalState } from '@/state/global.state';
import { Asset, AssetStatus, AssetStatusLabel, PUBLIC_ASSET } from '@/types';

const AddAssetMessage = () => (
  <div>
    <div>
      <h3 className="m-0 text-xl font-medium text-gray-700">
        What is an Asset?
      </h3>
      <p className="text-md mb-2 text-gray-500">
        Any component of your IT infrastructure at risk of cyberattacks.
      </p>
      <p className="mt-0 rounded-sm bg-layer1 p-4 text-sm text-gray-500">
        For example, at Acme Corporation, an asset could be:
        <ul className="my-0 list-disc pl-5 text-sm marker:text-gray-300 ">
          <li>
            Domains: <span className="font-semibold">acme.com</span>
          </li>
          <li>
            IP Addresses: <span className="font-semibold">8.8.8.8</span>
          </li>
          <li>
            CIDR Ranges: <span className="font-semibold">8.8.8.0/24</span>
          </li>
          <li>
            GitHub Organizations:{' '}
            <span className="font-semibold">https://github.com/acme-corp</span>
          </li>
        </ul>
      </p>
    </div>
  </div>
);

export function AddAsset() {
  const {
    modal: {
      asset: { open, onOpenChange },
    },
  } = useGlobalState();
  // eslint-disable-next-line
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Values>({});
  const { mutateAsync: createAsset, status: creatingAsset } = useCreateAsset();

  function onClose() {
    onOpenChange(false);
    setSelectedIndex(0);
  }

  async function handleAddAsset() {
    await createAsset({
      name: String(formData.asset),
      status: formData.status as Asset['status'],
    });

    onClose();
  }

  return (
    <Modal
      title="Configure Asset Discovery"
      className="h-[60vh] px-0 pl-6"
      open={open}
      onClose={onClose}
      footer={{
        isLoading: creatingAsset === 'pending',
        text: 'Add',
        onClick: handleAddAsset,
      }}
      size="lg"
      closeOnOutsideClick={false}
      icon={<AssetsIcon className="size-6 text-default-light" />}
    >
      <AddAssetMessage />
      <Inputs
        values={formData}
        onChange={setFormData}
        inputs={[
          {
            name: 'username',
            value: PUBLIC_ASSET,
            hidden: true,
          },
          {
            label: 'Asset',
            value: '',
            placeholder: 'acme.com',
            name: 'asset',
            required: true,
            className: 'h-11',
          },
          {
            label: 'Priority',
            value: AssetStatus.Active,
            type: Input.Type.SELECT,
            placeholder: 'Select Priority',
            name: 'status',
            options: [
              {
                label: AssetStatusLabel[AssetStatus.ActiveHigh],
                value: AssetStatus.ActiveHigh,
              },
              {
                label: AssetStatusLabel[AssetStatus.Active],
                value: AssetStatus.Active,
              },
              {
                label: AssetStatusLabel[AssetStatus.ActiveLow],
                value: AssetStatus.ActiveLow,
              },
            ],
            required: true,
            className: 'h-11',
          },
        ]}
      />
      <p className="mt-4 rounded bg-yellow-100 p-2 text-sm text-yellow-600">
        <ExclamationTriangleIcon className="mr-2 inline size-5 text-yellow-700" />
        <a
          href="https://github.com/praetorian-inc/praetorian-cli"
          target={'_blank'}
          rel={'noreferrer'}
          className="inline p-0 text-yellow-900 no-underline"
        >
          Praetorian CLI
        </a>{' '}
        is available for bulk asset addition.
      </p>
    </Modal>
  );
}
