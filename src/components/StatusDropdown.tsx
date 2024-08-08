import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { countDescription } from '@/components/Menu';
import { useCounts } from '@/hooks/useCounts';
import { RiskStatus, RiskStatusLabel } from '@/types';

interface StatusDropdownProps {
  onSelect: (selected: RiskStatus[]) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ onSelect }) => {
  const { data } = useCounts({ resource: 'risk' });
  const [statusFilter, setStatusFilter] = useState<RiskStatus[]>([]);
  const statusData: { [key: string]: number } = data?.status || {};
  const name = 'Statuses';

  const handleSelect = (selectedRows: RiskStatus[]) => {
    setStatusFilter(selectedRows);
    onSelect(selectedRows);
  };

  // Compute the counts for each status
  const getStatusCounts = (): { [key in RiskStatus]: number } => {
    const counts: { [key in RiskStatus]: number } = {
      T: 0,
      O: 0,
      C: 0,
      CR: 0,
      CF: 0,
      CS: 0,
      M: 0,
    };

    Object.keys(statusData).forEach(key => {
      const baseStatus = key[0];
      const subStatus = key.length > 1 ? key.slice(2) : '';
      const count = statusData[key];

      if (baseStatus === 'M') {
        counts.M += count;
      } else if (baseStatus === 'T') {
        counts.T += count;
      } else if (baseStatus === 'O') {
        counts.O += count;
      } else if (baseStatus === 'C') {
        if (subStatus === '') {
          counts.C += count;
        } else if (subStatus === 'R') {
          counts.CR += count;
        } else if (subStatus === 'F') {
          counts.CF += count;
        }
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Dropdown
      styleType="header"
      label={
        statusFilter.filter(Boolean).length === 0
          ? `All ${name}`
          : statusFilter.map(status => RiskStatusLabel[status]).join(', ')
      }
      className="capitalize"
      endIcon={<ChevronDownIcon className="size-5 text-gray-500" />}
      menu={{
        items: [
          {
            label: `All ${name}`,
            labelSuffix: Object.values(statusCounts)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            value: '',
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          ...Object.keys(RiskStatusLabel).map(status => ({
            label: RiskStatusLabel[status as RiskStatus],
            labelSuffix: (
              statusCounts[status as RiskStatus] || 0
            ).toLocaleString(),
            value: status,
          })),
          countDescription,
        ],
        onSelect: value => handleSelect(value as RiskStatus[]),
        value: statusFilter,
        multiSelect: true,
      }}
    />
  );
};

export default StatusDropdown;
