import React, { useState } from 'react';
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
import CircularProgressBar from '@/components/CircularProgressBar';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Overview = () => {
  const client_short = 'Acme Corp.';
  const [reportReady, setReportReady] = useState(false);
  const [jobsRunning, setJobsRunning] = useState(5);
  const [showDetails, setShowDetails] = useState(false);

  const toggleReportStatus = () => {
    setReportReady(!reportReady);
    setJobsRunning(reportReady ? 5 : 0);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Counts
        stats={{
          seeds: 100,
          assets: 300,
          risks: 50,
          jobs: jobsRunning,
        }}
      />

      <label className="flex items-center cursor-pointer absolute top-0 left-0">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={reportReady}
            onChange={toggleReportStatus}
          />
          <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
          <div
            className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
              reportReady ? 'transform translate-x-full bg-blue-500' : ''
            }`}
          ></div>
        </div>
      </label>

      <div className="mt-6 flex flex-col space-y-6 bg-white p-2 shadow-sm rounded-[2px]">
        {reportReady ? (
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
        ) : (
          <div className="flex flex-col justify-center p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl font-semibold text-gray-700 mb-4">
                The report is being generated...
              </div>
              <CircularProgressBar />
              <div className="text-gray-600 mt-4">
                We have {jobsRunning} job{jobsRunning !== 1 && 's'} running
                right now to gather all the necessary data.
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                {showDetails ? 'Hide Details' : 'Show Additional Details'}
              </button>
            </div>
            {showDetails && (
              <div className="mt-4 text-gray-600">
                <h3 className="text-lg font-bold text-gray-800">
                  What is a Risk Report?
                </h3>
                <p className="mt-2">
                  A risk report starts with a set of{' '}
                  <span className="font-semibold text-gray-800">seeds</span>{' '}
                  like domains, IP addresses, or GitHub organizations. These
                  seeds help us find{' '}
                  <span className="font-semibold text-gray-800">assets</span>{' '}
                  such as servers, databases, and endpoints. Each asset is
                  thoroughly scanned for any potential security risks. All this
                  information is combined to create a daily report, highlighting
                  the most critical findings. The aim is to provide you with
                  actionable insights to enhance your security posture.
                </p>
                <ul className="mt-4 list-disc list-inside text-gray-700">
                  <li>Scanning for risks</li>
                  <li>Analyzing asset configurations and exposures</li>
                  <li>Compiling findings into comprehensive reports</li>
                </ul>
                <p className="mt-2">
                  The daily report gives you a detailed view of your current
                  security status, helping you make informed decisions to
                  protect your assets effectively.
                </p>
                <div className="mt-6 text-gray-600">
                  <h3 className="text-lg font-bold text-gray-800">
                    Why are Jobs Running?
                  </h3>
                  <p className="mt-2">
                    Our system is currently working hard with {jobsRunning} job
                    {jobsRunning !== 1 && 's'} in progress. These jobs are
                    critical to gather and analyze data, ensuring an up-to-date
                    risk assessment. Here's what they involve:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-gray-700">
                    <li>Discovering assets from the provided seeds</li>
                    <li>Scanning each asset for security risks</li>
                    <li>Analyzing configurations and exposures</li>
                    <li>Compiling data into comprehensive reports</li>
                  </ul>
                  <p className="mt-2">
                    Each job represents our commitment to providing you with
                    detailed and actionable risk reports. The number of jobs
                    running reflects our dedication to ensure all relevant data
                    is collected and analyzed promptly.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
