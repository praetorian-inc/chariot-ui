import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { useCounts } from '@/hooks/useCounts';
import { AssetStatus, AssetStatusLabel } from '@/types';

interface AssetStatusDropdownProps {
  onSelect: (selected: AssetStatus[]) => void;
}

const AssetStatusDropdown: React.FC<AssetStatusDropdownProps> = ({
  onSelect,
}) => {
  const { data } = useCounts({ resource: 'asset' });
  const [statusFilter, setStatusFilter] = useState<AssetStatus[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { FL, FH, ...restStatus } = data?.status || {};
  const statusData: { [key: string]: number } = {
    ...restStatus,
    [AssetStatus.Frozen]: Object.entries(data?.status || {}).reduce(
      (acc, [key, value]) => {
        if (key.startsWith('F')) {
          return acc + value;
        }

        return acc;
      },
      0
    ),
  };
  const name = 'Statuses';

  const handleSelect = (selectedRows: AssetStatus[]) => {
    if (
      selectedRows.length === 0 ||
      selectedRows.length === Object.keys(AssetStatusLabel).length
    ) {
      setStatusFilter([]);
      onSelect([]);
    } else {
      setStatusFilter(selectedRows);
      onSelect(selectedRows);
    }
  };

  const allSelected =
    statusFilter.length === 0 ||
    statusFilter.length === Object.keys(AssetStatusLabel).length;

  return (
    <Dropdown
      styleType="header"
      label={
        allSelected
          ? `All ${name}`
          : statusFilter.map(status => AssetStatusLabel[status]).join(', ')
      }
      className="capitalize"
      endIcon={<ChevronDownIcon className="size-5 text-gray-500" />}
      menu={{
        items: [
          {
            label: `All ${name}`,
            labelSuffix: Object.values(statusData)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            value: '',
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          ...Object.keys(AssetStatusLabel).map(status => ({
            label: AssetStatusLabel[status as AssetStatus],
            labelSuffix: (
              statusData[status as AssetStatus] || 0
            ).toLocaleString(),
            value: status,
          })),
        ],
        onSelect: value => {
          const selectedValues = value.filter(v => v !== '');
          handleSelect(selectedValues as AssetStatus[]);
        },
        value: statusFilter,
        multiSelect: true,
      }}
    />
  );
};

export default AssetStatusDropdown;
