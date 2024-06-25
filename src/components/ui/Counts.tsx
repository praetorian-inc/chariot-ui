import React, { useState } from 'react';
import { Loader } from '@/components/Loader';
import { OverviewLabels, Statistics } from '@/types';
import { QueryStatus } from '@/utils/api';
import { cn } from '@/utils/classname';
import { Modal } from '@/components/Modal';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { AssetsIcon, RisksIcon, SeedsIcon } from '@/components/icons';

const countsLabel = OverviewLabels;

const countsDefinition: Record<string, React.ReactNode> = {
  seeds: `Seeds can be a domain, IPv4, IPv6, CIDR range, or GitHub organization. It represents the starting point for our scanning process.`,
  assets: `Assets are the discovered items from the scanning process, including servers, databases, APIs, and more.`,
  risks: `Risks are identified vulnerabilities or threats found during the scanning process, categorized by their severity.`,
  jobs: `Jobs are the tasks and processes performed by the platform, such as scanning, analyzing, and reporting.`,
};

interface CountsProps {
  stats: Statistics;
  status?: QueryStatus;
}

const Counts: React.FC<CountsProps> = ({ stats, status }) => {
  const countsObject: Record<
    string,
    { label: string; count: number; definition: React.ReactNode }
  > = Object.entries(countsLabel).reduce((acc, [key, label]) => {
    return {
      ...acc,
      [key]: {
        label,
        count: stats[key] || 0,
        definition: countsDefinition[key],
      },
    };
  }, {});

  const icons = {
    seeds: <SeedsIcon className="w-5 h-5" />,
    assets: <AssetsIcon className="w-5 h-5" />,
    risks: <RisksIcon className="w-5 h-5" />,
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl">
      <div className="flex flex-nowrap justify-stretch gap-x-5">
        {Object.entries(countsObject).map(
          ([key, { label, count, definition }]) => (
            <div
              key={key}
              className={cn(
                'flex w-full flex-col bg-layer0 border-b-4 px-4 py-2 rounded-[2px] shadow-sm border-transparent'
              )}
            >
              <Loader isLoading={status === 'pending'} className="my-3 h-2">
                <div className="text-2xl font-semibold flex items-center">
                  <span className="mr-1">
                    {icons[key as keyof typeof icons]}
                  </span>{' '}
                  {count?.toLocaleString()}{' '}
                  <span className="text-md font-light text-gray-500 ml-3">
                    {label}
                  </span>
                </div>
              </Loader>
              <div className="text-xs pt-2 font-medium flex items-center justify-between">
                <span className="block text-gray-500 text-xs">
                  {definition}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Counts;
