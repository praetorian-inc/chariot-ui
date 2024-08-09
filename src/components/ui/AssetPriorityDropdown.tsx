import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

import { Dropdown } from '@/components/Dropdown';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { Tooltip } from '@/components/Tooltip';
import { useUpdateAsset } from '@/hooks/useAssets';
import { Asset, AssetStatus, AssetStatusLabel } from '@/types';

interface Props {
  asset: Asset;
}

const options = Object.entries(AssetStatusLabel).map(([key, value]) => ({
  label: value,
  value: key,
  icon: getAssetStatusIcon(key as AssetStatus),
}));

export const AssetStatusDropdown = (props: Props) => {
  const { asset } = props;
  const { mutateAsync: updateAsset, status: updateAssetStatus } =
    useUpdateAsset();
  const simplifiedStatus = asset.status.startsWith('F')
    ? AssetStatus.Frozen
    : asset.status;
  const [status, setStatus] = useState(simplifiedStatus);

  function handleChange(status: AssetStatus) {
    // setShowAssetStatusWarning(false);
    setStatus(status);

    updateAsset({
      key: asset.key,
      name: asset.name,
      status,
      showSnackbar: true,
    });
  }

  return (
    <Tooltip title="Change Status">
      <Dropdown
        className={`min-w-52 justify-between rounded-md bg-white pr-2`}
        menu={{
          items: options,
          onClick: value => {
            if (value) {
              handleChange(value as AssetStatus);
            }
          },
        }}
        disabled={updateAssetStatus === 'pending'}
        startIcon={options.find(option => option.value === status)?.icon}
        endIcon={<ChevronDownIcon className="mr-1 size-3 text-default" />}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex-1 text-left">{AssetStatusLabel[status]}</div>
      </Dropdown>
    </Tooltip>
  );
};
