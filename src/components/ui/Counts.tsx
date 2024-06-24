import React from 'react';

import { Loader } from '@/components/Loader';
import {
  AssetLabels,
  DisplaySeverities,
  FileLabels,
  JobLabels,
  OverviewLabels,
  SeedLabels,
  Statistics,
} from '@/types';
import { QueryStatus } from '@/utils/api';
import { cn } from '@/utils/classname';

type CountType = 'risks' | 'assets' | 'jobs' | 'seeds' | 'files' | 'overview';

const countsLabel: Record<CountType, Record<string, string>> = {
  risks: DisplaySeverities,
  assets: AssetLabels,
  jobs: JobLabels,
  seeds: SeedLabels,
  files: FileLabels,
  overview: OverviewLabels,
};

interface CountsProps {
  type: CountType;
  stats: Statistics;
  onClick?: (label: string) => void;
  selected?: string;
  status?: QueryStatus;
}

const Counts: React.FC<CountsProps> = ({
  stats,
  onClick,
  selected,
  type,
  status,
}) => {
  const countsObject: Record<string, { label: string; count: number }> =
    Object.entries(countsLabel[type]).reduce((acc, [key, label]) => {
      return {
        ...acc,
        [key]: {
          label,
          count: stats[key] || 0,
        },
      };
    }, {});

  return (
    <div className="mx-auto w-full max-w-screen-xl">
      <div className="flex flex-nowrap justify-stretch gap-x-5">
        {Object.entries(countsObject).map(([key, { label, count }]) => (
          <button
            key={key}
            disabled={onClick === undefined}
            className={cn(
              'flex w-full flex-col bg-layer0 border-b-4 px-4 py-2 rounded-[2px] shadow-sm',
              selected === key ? 'border-brand' : 'border-transparent'
            )}
            onClick={() => {
              if (onClick) {
                onClick(key);
              }
            }}
          >
            <Loader isLoading={status === 'pending'} className="my-3 h-2">
              <div className="text-2xl font-semibold">
                {count?.toLocaleString()}
              </div>
            </Loader>
            <div className="text-xs font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Counts;
