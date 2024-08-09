import { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import CircularProgressBar from '@/components/CircularProgressBar';
import { Tabs } from '@/components/Tab';
import { useGetAccountDetails } from '@/hooks/useAccounts';
import { useAggregateCounts } from '@/hooks/useAggregateCounts';
import { useGetFile } from '@/hooks/useFiles';
import { useMy } from '@/hooks/useMy';
import { getReportSections } from '@/sections/overview/constants';
import { useAuth } from '@/state/auth';
import { cn } from '@/utils/classname';

export const Report = () => {
  const { me, friend } = useAuth();
  const { data: accounts } = useMy({
    resource: 'account',
  });

  const client = useGetAccountDetails(accounts).name || friend || me;
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const { counts } = useAggregateCounts();
  const jobsRunning = counts.jobsRunning;

  const { data: fileContent, status } = useGetFile({
    name: `reports/report.latest`,
  });

  const reportReady = status === 'success' && fileContent;

  const reportSections = useMemo(
    () =>
      getReportSections({
        report: fileContent,
        data: {
          client,
          client_short: client,
          client_possessive: `${client}'s`,
        },
      }),
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
    <div className="flex flex-col">
      <div
        className={cn(
          'flex flex-col space-y-6 rounded-[2px] bg-white p-2 shadow-sm'
        )}
      >
        {reportReady ? (
          <Tabs
            tabs={Object.entries(reportSections).map(
              ([tab, tabContent], index) => ({
                label: tab,
                id: index,
                Content: () => (
                  <>
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
                    <div className="flex flex-row">
                      <Button
                        className="p-0"
                        onClick={() => downloadFileContent()}
                        styleType="none"
                        startIcon={<DocumentArrowDownIcon className="size-6" />}
                      >
                        Download Report
                      </Button>
                    </div>
                  </>
                ),
              })
            )}
            styleType="horizontal"
            defaultValue={0}
            value={selectedTab}
            onChange={setSelectedTab}
            tabWrapperclassName=""
            contentWrapperClassName="p-4 prose max-w-none"
          />
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
