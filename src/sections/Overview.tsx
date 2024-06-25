import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

import Counts from '@/components/ui/Counts';
import { BusinessImpact } from '@/sections/overview/BusinessImpact';
import { Conclusion } from '@/sections/overview/Conclusion';
import { ExecutiveSummary } from '@/sections/overview/ExecutiveSummary';
import { Findings } from '@/sections/overview/Findings';
import { Recommendations } from '@/sections/overview/Recommendations';
import { Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/Button';

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
      <h1 className="center-align mb-1 mt-6 flex items-center text-2xl font-light text-gray-500">
        Daily Report
        <Tooltip title="Download PDF" placement="right">
          <Button onClick={() => {}} styleType="none">
            <DocumentArrowDownIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
      </h1>
      <div className="flex flex-col space-y-6 bg-white p-2 shadow-sm roundex-[2px]">
        <TabGroup>
          <TabList className="flex p-1">
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
                    selected ? 'border-b-4 border-brand text-brand' : '',
                    !selected ? 'border-b-2 border-gray-100 bg-layer0' : ''
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="p-6">
            <TabPanel>
              <ExecutiveSummary />
            </TabPanel>
            <TabPanel>
              <Findings />
            </TabPanel>
            <TabPanel>
              <Recommendations client_short={client_short} />
            </TabPanel>
            <TabPanel>
              <BusinessImpact />
            </TabPanel>
            <TabPanel>
              <Conclusion />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};
