import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { useCounts } from '@/hooks/useCounts';

interface SourceDropdownProps {
  type: 'asset' | 'job' | 'risk';
  onSelect: (selected: string[]) => void;
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

  const name = 'Origins';

  function override(item: string) {
    switch (item?.toLowerCase()) {
      case 'azuread-discovery':
        return 'Azure AD Discovery';
      case 'github':
        return 'GitHub';
      case 'github-discovery':
        return 'GitHub Discovery';
      case 'ssh':
      case 'ns1':
      case 'cidr':
      case 'whois':
        return item.toUpperCase();
      default:
        if (item.includes('@')) return item;
        return <span>{item}</span>;
    }
  }

  return (
    <Dropdown
      styleType="header"
      label={
        sourcesFilter.filter(Boolean).length === 0
          ? `All ${name}`
          : sourcesFilter.join(', ')
      }
      className="capitalize"
      endIcon={<ChevronDownIcon className="size-5 text-gray-500" />}
      menu={{
        items: [
          {
            label: `All ${name}`,
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
            label: override(item),
            labelSuffix: sourceData[item].toLocaleString(),
            value: item,
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
