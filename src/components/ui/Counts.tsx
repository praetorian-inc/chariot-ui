import React from 'react';
import { Loader } from '@/components/Loader';
import { OverviewLabels, Statistics } from '@/types';
import { QueryStatus } from '@/utils/api';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

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
    <div className="flex items-center justify-between">
      {Object.entries(countsObject).map(
        ([key, { label, count, definition }], index, array) => (
          <React.Fragment key={key}>
            <div className="bg-white p-4 w-1/3 h-28">
              <Loader isLoading={status === 'pending'}>
                <span className="text-lg font-semibold mt-2">
                  {count.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600 text-center ml-1">
                  {label}
                </span>
              </Loader>
              <div className="text-xs text-gray-500 pt-1">{definition}</div>
            </div>
            {index < array.length - 1 && (
              <div className="h-full mx-2">
                <ArrowRightIcon className="w-9 h-11 text-gray-300 " />
              </div>
            )}
          </React.Fragment>
        )
      )}
    </div>
  );
};

export default Counts;
