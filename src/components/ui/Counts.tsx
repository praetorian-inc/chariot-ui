import React from 'react';

import { AssetsIcon, RisksIcon, SeedsIcon } from '@/components/icons';
import { AnimatedArrowIcon } from '@/components/icons/AnimatedArrow.icon';
import { Loader } from '@/components/Loader';
import { OverviewLabels, Statistics } from '@/types';
import { QueryStatus } from '@/utils/api';

const countsLabel = OverviewLabels;

const countsDefinition: Record<string, React.ReactNode> = {
  seeds: `Seeds are starting points like domains or IP addresses. They initiate scans that detect assets.`,
  assets: `Assets are elements found from seeds, such as servers or databases. We analyze these assets to identify risks.`,
  risks: `Risks are security threats detected in assets. We assess these to offer clear, actionable recommendations in your report.`,
};

interface CountsProps {
  stats: Statistics;
  status?: QueryStatus;
}

const icons: Record<string, React.ReactNode> = {
  seeds: <SeedsIcon className="mb-1 mr-1 inline size-4 text-gray-500" />,
  assets: <AssetsIcon className="mb-1 mr-1 inline size-4 text-gray-500" />,
  risks: <RisksIcon className="mb-0.5 mr-1 inline size-4 text-gray-500" />,
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
            <div className="relative h-28 w-full rounded-[2px] bg-white p-4 shadow-sm md:w-1/3">
              <Loader isLoading={status === 'pending'}>
                <span className="mt-2 text-2xl font-semibold">
                  {count.toLocaleString()}
                </span>
                <span className="ml-2 text-center text-sm text-gray-600">
                  {label}
                </span>
                <div className="absolute right-1 top-1">{icons[key]}</div>
              </Loader>
              <div className="pt-1 text-xs text-gray-500">{definition}</div>
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
