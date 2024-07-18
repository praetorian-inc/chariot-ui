import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/form/Input';
import { Inputs, Values } from '@/components/form/Inputs';
import { AssetsIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { useCreateAsset } from '@/hooks/useAssets';
import { useGlobalState } from '@/state/global.state';
import { Asset, AssetStatus, AssetStatusLabel } from '@/types';

const AddAssetExamples = () => (
  <div className="text-md mt-4 rounded-md bg-gray-100 p-4 text-gray-700">
    <p className="mb-3 font-medium text-gray-800">Example asset:</p>
    <p>
      <span className="font-semibold">acme.com</span>: Domain name
    </p>
    <p>
      <span className="font-semibold">8.8.8.8</span>: IP Addresses
    </p>
    <p>
      <span className="font-semibold">8.8.8.0/24</span>: CIDR Ranges
    </p>
    <p>
      <span className="font-semibold">https://github.com/acme-corp</span>:
      GitHub Org
    </p>
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
      title="Add Asset"
      className="px-10 py-6"
      open={open}
      onClose={onClose}
      footer={{
        isLoading: creatingAsset === 'pending',
        text: 'Add',
        onClick: handleAddAsset,
      }}
      size="md"
      closeOnOutsideClick={false}
      icon={<AssetsIcon className="size-6 text-default-light" />}
    >
      <Inputs
        values={formData}
        onChange={setFormData}
        className="mb-4"
        inputs={[
          {
            label: 'Asset',
            value: '',
            placeholder: 'acme.com',
            name: 'asset',
            required: true,
            className: 'h-11 m-5',
          },
          {
            label: 'Status',
            value: AssetStatus.Active,
            type: Input.Type.SELECT,
            placeholder: 'Select Status',
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
              {
                label: AssetStatusLabel[AssetStatus.Frozen],
                value: AssetStatus.Frozen,
              },
            ],
            required: true,
            className: 'h-11 m-5',
          },
        ]}
      />
      <AddAssetExamples />
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
