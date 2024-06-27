import React, { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Button } from '@/components/Button';
import CircularProgressBar from '@/components/CircularProgressBar';
import { Input } from '@/components/form/Input';
import { Tooltip } from '@/components/Tooltip';
import Counts from '@/components/ui/Counts';
import { useAggregateCounts } from '@/hooks/useAggregateCounts';
import { getReportSections } from '@/sections/overview/constants';
import { cn } from '@/utils/classname';
import { addDays, subtractDays } from '@/utils/date.util';
import { useGetFile } from '@/hooks/useFiles';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const TODAY = formatDate(new Date());

export const Overview = () => {
  const client_short = 'Acme Corp.';
  const [showDetails, setShowDetails] = useState(false);
  const { counts } = useAggregateCounts();
  const jobsRunning = counts.jobsRunning;

  const { data: fileContent, status } = useGetFile({
    name: `reports/report.latest`,
  });

  const reportReady = status === 'success' && fileContent;

  const reportSections = useMemo(
    () => getReportSections({ report: fileContent, data: { client_short } }),
    [fileContent]
  );

  const getBorderClass = (subHeading = '') => {
    if (subHeading.includes('Non-Critical')) {
      return 'border-yellow-600';
    }

    if (subHeading.includes('Critical') || subHeading.includes('High-Risk')) {
      return 'border-red-600';
    }

    return '';
  };

  if (status === 'pending') return <></>;

  const downloadFileContent = () => {
    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'report.md';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Counts
        stats={{
          seeds: counts.seeds,
          assets: counts.assets,
          risks: counts.risks,
          jobs: counts.jobs,
        }}
      />

      {reportReady && (
        <div className="flex ">
          <h1 className="center-align mb-1 mt-6 flex items-center text-2xl font-light text-gray-500">
            Daily Report
            <Tooltip title="Download Markdown" placement="right">
              <Button onClick={() => downloadFileContent()} styleType="none">
                <DocumentArrowDownIcon className="size-6" />
              </Button>
            </Tooltip>
          </h1>
        </div>
      )}
      <div
        className={cn(
          'mt-6 flex flex-col space-y-6 rounded-[2px] bg-white p-2 shadow-sm',
          reportReady && 'mt-3'
        )}
      >
        {reportReady ? (
          <TabGroup>
            <TabList className="flex overflow-x-auto p-1">
              {Object.keys(reportSections).map(tab => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      'w-full py-4 px-2 text-sm font-semibold leading-5 hover:bg-gray-50 focus:outline-0',
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
              {Object.entries(reportSections).map(([heading, tabContent]) => {
                return (
                  <TabPanel key={heading} className="prose max-w-none">
                    {typeof tabContent === 'string' && (
                      <Markdown>{tabContent}</Markdown>
                    )}
                    {typeof tabContent !== 'string' &&
                      Object.entries(tabContent).map(
                        ([subHeading, subContent]) => {
                          return (
                            <div
                              key={subHeading}
                              className={cn(
                                'border-l-4 pl-4',
                                getBorderClass(subHeading)
                              )}
                            >
                              <h3>{subHeading}</h3>
                              <Markdown key={subHeading}>{subContent}</Markdown>
                            </div>
                          );
                        }
                      )}
                  </TabPanel>
                );
              })}
            </TabPanels>
          </TabGroup>
        ) : (
          <div className="flex flex-col justify-center p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-xl font-semibold text-gray-700">
                A report is being generated...
              </div>
              <CircularProgressBar />
              <div className="mt-4 text-gray-600">
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
                <ul className="mt-4 list-inside list-disc text-gray-700">
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
                    risk assessment. Here&apos;s what they involve:
                  </p>
                  <ul className="mt-2 list-inside list-disc text-gray-700">
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

const DateComp = ({
  className,
  date,
  setDate,
}: {
  className?: string;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const iconClassName =
    'size-6 cursor-pointer rounded-full p-1 hover:bg-default-light';
  return (
    <div className={cn('ml-auto flex items-center gap-2', className)}>
      <ChevronDoubleLeftIcon
        className={iconClassName}
        onMouseDown={e => e.preventDefault()}
        onClick={() =>
          setDate((date: string) => formatDate(subtractDays(new Date(date), 1)))
        }
      />
      <Input
        type={Input.Type.DATE}
        max={TODAY}
        onChange={e => setDate(e.target.value)}
        value={date}
        name="date"
      />

      <ChevronDoubleRightIcon
        className={cn(
          iconClassName,
          date === TODAY && 'cursor-not-allowed opacity-50'
        )}
        onMouseDown={e => e.preventDefault()}
        onClick={() =>
          date === TODAY
            ? {}
            : setDate(date => {
                return formatDate(addDays(new Date(date), 1));
              })
        }
      />
    </div>
  );
};
