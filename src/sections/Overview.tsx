import React from 'react';
import { Tab } from '@headlessui/react';
import Counts from '@/components/ui/Counts';
import { BusinessImpact } from '@/sections/overview/BusinessImpact';
import { Conclusion } from '@/sections/overview/Conclusion';
import { Findings } from '@/sections/overview/Findings';
import { NewFeatures } from '@/sections/overview/NewFeatures';
import { Recommendations } from '@/sections/overview/Recommendations';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Overview = () => {
  const client_short = 'Acme Corp.';
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Counts
        stats={{
          seeds: 100,
          assets: 300,
          risks: 50,
        }}
      />

      <div className="flex space-x-6">
        <div className="w-3/4 rounded-[2px] bg-white p-6 shadow-md">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-[2px] bg-blue-900/20 p-1">
              {[
                'Findings',
                'Recommendations',
                'Business Impact',
                'Conclusion',
              ].map(tab => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-[2px] py-4 text-sm font-semibold leading-5',
                      selected ? 'bg-white shadow-md' : ''
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
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
        <div className="w-1/4">
          <NewFeatures />
        </div>
      </div>
    </div>
  );
};
