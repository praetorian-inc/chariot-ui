import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { useCounts } from '@/hooks/useCounts';

interface SourceDropdownProps {
  type: 'asset' | 'job' | 'risk';
  onSelect: (selected: string[]) => void;
  types?: string[];
}

interface SourceData {
  [key: string]: number;
}

const SourceDropdown: React.FC<SourceDropdownProps> = ({ type, onSelect }) => {
  const { data } = useCounts({
    resource: type,
  });

  const [sourcesFilter, setSourcesFilter] = useState<string[]>(['']);
  const sourceData: SourceData = (data?.source as unknown as SourceData) || {};

  const handleSelect = (selectedRows: string[]) => {
    setSourcesFilter(selectedRows);
    onSelect(selectedRows);
  };

  return (
    <Dropdown
      styleType="header"
      label={
        sourcesFilter.filter(Boolean).length === 0
          ? 'All Sources'
          : sourcesFilter.join(', ')
      }
      className="capitalize"
      endIcon={<ChevronDownIcon className="size-5 text-gray-500" />}
      menu={{
        items: [
          {
            label: 'All Sources',
            labelSuffix: Object.values(sourceData)
              ?.reduce((a, b) => a + b, 0)
              ?.toLocaleString(),
            value: '',
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          ...Object.keys(sourceData).map(item => ({
            label: item,
            labelSuffix: sourceData[item].toLocaleString(),
            value: item,
            className: 'capitalize',
          })),
        ],
        onSelect: handleSelect,
        value: sourcesFilter,
        multiSelect: true,
      }}
    />
  );
};

export default SourceDropdown;
