import React from 'react';
import { Tab } from '@headlessui/react';
import Counts from '@/components/ui/Counts';
import { BusinessImpact } from '@/sections/overview/BusinessImpact';
import { Conclusion } from '@/sections/overview/Conclusion';
import { Findings } from '@/sections/overview/Findings';
import { Recommendations } from '@/sections/overview/Recommendations';
import { ExecutiveSummary } from '@/sections/overview/ExecutiveSummary';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Overview = () => {
  const client_short = 'Acme Corp.';
  return (
    <div className="flex min-h-screen flex-col">
      <Counts
        stats={{
          seeds: 100,
          assets: 300,
          risks: 50,
        }}
      />
      <h1 className="text-2xl font-light text-gray-500 mt-6 mb-1 ml-2">
        My Report
      </h1>
      <div className="flex flex-col space-y-6 bg-white p-2">
        <Tab.Group>
          <Tab.List className="flex space-x-1 bg-layer0 p-1">
            {[
              'Executive Summary',
              'Findings',
              'Recommendations',
              'Business Impact',
              'Conclusion',
            ].map(tab => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  classNames(
                    'w-full py-4 text-sm font-semibold leading-5 hover:bg-gray-50 focus:outline-0',
                    selected ? 'border-b-4 border-brand' : ''
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            <Tab.Panel>
              <ExecutiveSummary />
            </Tab.Panel>
            <Tab.Panel>
              <Findings />
            </Tab.Panel>
            <Tab.Panel>
              <Recommendations client_short={client_short} />
            </Tab.Panel>
            <Tab.Panel>
              <BusinessImpact />
            </Tab.Panel>
            <Tab.Panel>
              <Conclusion />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
