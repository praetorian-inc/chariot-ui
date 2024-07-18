import React from 'react';

import { AssetsIcon, RisksIcon } from '@/components/icons';
import { AnimatedArrowIcon } from '@/components/icons/AnimatedArrow.icon';
import { Loader } from '@/components/Loader';
import { OverviewLabels } from '@/types';
import { QueryStatus } from '@/utils/api';

const countsLabel = OverviewLabels;

const countsDefinition: Record<string, React.ReactNode> = {
  assets: `Entities such as servers, applications, and databases that have been discovered and are being continuously monitored by the platform to ensure their security and integrity.`,
  risks: `Potential security threats and vulnerabilities identified by the platform within your monitored assets, highlighting areas that require attention and remediation.`,
};

interface CountsProps {
  stats: Statistics;
  status?: QueryStatus;
}

interface Statistics {
  [key: string]: number;
}

const icons: Record<string, React.ReactNode> = {
  assets: <AssetsIcon className="m-1 size-4 text-disabled" />,
  risks: <RisksIcon className="m-1 size-4 text-disabled" />,
};

const Counts: React.FC<CountsProps> = ({ stats, status }) => {
  const countsObject: Record<
    string,
    { label: string; count: number; definition: React.ReactNode }
  > = Object.entries(countsLabel).reduce(
    (acc, [key, label]) => ({
      ...acc,
      [key]: {
        label,
        count: stats[key] || 0,
        definition: countsDefinition[key],
      },
    }),
    {}
  );

  return (
    <div className="flex flex-col items-center justify-between md:flex-row">
      {Object.entries(countsObject).map(
        ([key, { label, count, definition }], index, array) => (
          <React.Fragment key={key}>
            <div className="relative w-full rounded-[2px] bg-white p-4 shadow-sm md:w-1/2">
              <Loader isLoading={status === 'pending'}>
                <span className="mt-2 text-2xl font-semibold">
                  {count.toLocaleString()}
                </span>
                <span className="ml-2 text-center text-2xl font-extralight text-gray-500">
                  {label}
                </span>
                <div className="absolute right-1 top-1">{icons[key]}</div>
              </Loader>
              <div className="pt-3 text-xs text-gray-500">{definition}</div>
            </div>
            {index < array.length - 1 && (
              <div className="mx-3">
                <AnimatedArrowIcon
                  className="rotate-90 md:rotate-0 "
                  delay={index + 1 + 's'}
                />
              </div>
            )}
          </React.Fragment>
        )
      )}
    </div>
  );
};

export default Counts;
