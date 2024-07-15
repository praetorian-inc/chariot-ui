import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { getFilterLabel } from '@/sections/RisksTable';
import { Asset, Job, Risk } from '@/types';

interface SourceDropdownProps {
  data: (Asset | Job | Risk)[];
  type: 'asset' | 'job' | 'risk';
  onSelect: (selected: string[]) => void;
  seeds?: string[];
}

const SOURCES = [
  { name: 'nuclei', label: 'nuclei', type: 'risk' },
  { name: 'whois', label: 'whois', type: 'risk' },
  { name: 'subdomain', label: 'subdomain', type: 'asset' },
  { name: 'cidr', label: 'cidr', type: 'asset' },
  { name: 'portscan', label: 'portscan', type: 'job' },
  { name: 'github', label: 'github', type: 'asset' },
  { name: 'secrets', label: 'secrets', type: 'risk' },
  { name: 'amazon', label: 'amazon', type: 'asset' },
  { name: 'azure', label: 'azure', type: 'asset' },
  { name: 'gcp', label: 'gcp', type: 'asset' },
  { name: 'ns1', label: 'ns1', type: 'asset' },
  { name: 'gato', label: 'gato', type: 'risk' },
  { name: 'crowdstrike', label: 'crowdstrike', type: 'asset' },
  { name: 'crawler', label: 'crawler', type: 'risk' },
  { name: 'gitlab', label: 'gitlab', type: 'asset' },
  { name: 'ssh', label: 'ssh', type: 'risk' },
];

const SourceDropdown: React.FC<SourceDropdownProps> = ({
  data,
  type,
  onSelect,
  seeds,
}) => {
  const relevantSources = useMemo(() => {
    if (seeds && seeds.length > 0) {
      return seeds.map(seed => ({
        name: seed,
        label: seed,
        type: 'asset',
      }));
    }

    return SOURCES.filter(source => {
      if (type === 'risk') {
        return source.type === 'risk';
      }
      if (type === 'asset') {
        return source.type === 'asset';
      }
      return true;
    });
  }, [type]);

  const [sourcesFilter, setSourcesFilter] = useState<string[]>(['']);

  useEffect(() => {
    onSelect(sourcesFilter.filter(f => f.trim().length > 0));
  }, [sourcesFilter]);

  const sourcesOptions = useMemo(() => {
    return relevantSources.map(source => ({
      label: source.name,
      value: source.name,
      labelSuffix: data.filter(item => item.source === source.name).length,
    }));
  }, [relevantSources, data]);

  return (
    <Dropdown
      styleType="header"
      label={getFilterLabel('Sources', sourcesFilter, sourcesOptions)}
      endIcon={<ChevronDownIcon className="size-5 text-gray-500" />}
      menu={{
        items: [
          {
            label: 'All Sources',
            labelSuffix: sourcesOptions
              .map(item => item.labelSuffix)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            value: '',
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          ...sourcesOptions.map(item => ({
            label: item.value,
            labelSuffix: item.labelSuffix.toLocaleString(),
            value: item.value,
          })),
        ],
        onSelect: (selectedRows: string[]) => setSourcesFilter(selectedRows),
        value: sourcesFilter,
        multiSelect: true,
      }}
    />
  );
};

export default SourceDropdown;
