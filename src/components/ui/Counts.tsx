import React, { useState } from 'react';
import { Loader } from '@/components/Loader';
import { OverviewLabels, Statistics } from '@/types';
import { QueryStatus } from '@/utils/api';
import { cn } from '@/utils/classname';
import { Modal } from '@/components/Modal';
import { InformationCircleIcon } from '@heroicons/react/20/solid';

const countsLabel = OverviewLabels;

const countsDefinition: Record<string, React.ReactNode> = {
  seeds: (
    <>
      <h3 className="text-lg font-bold">What is a Seed?</h3>
      <p className="mt-2">
        Seeds can be a domain, IPv4, IPv6, CIDR range, or GitHub organization.
        It represents the starting point for our scanning process.
      </p>
      <ul className="mt-2 list-disc list-inside">
        <li>Domains: example.com, mail.example.com</li>
        <li>IPv4 Addresses: 192.168.1.1</li>
        <li>CIDR Ranges: 192.168.1.0/24</li>
        <li>GitHub Organizations: https://github.com/example</li>
      </ul>
      <p className="mt-2">
        We will monitor these seeds, discover any associated assets you may have
        missed, and identify risks, enhancing your security by mitigating
        threats early.
      </p>
    </>
  ),
  assets: (
    <>
      <h3 className="text-lg font-bold">What is an Asset?</h3>
      <p className="mt-2">
        Assets are the discovered items from the scanning process, including
        servers, databases, APIs, and more.
      </p>
      <ul className="mt-2 list-disc list-inside">
        <li>Servers: web.example.com, db.example.com</li>
        <li>Databases: database.example.com</li>
        <li>APIs: api.example.com/v1/users</li>
      </ul>
      <p className="mt-2">
        We categorize and monitor these assets to ensure comprehensive coverage
        of your attack surface.
      </p>
    </>
  ),
  risks: (
    <>
      <h3 className="text-lg font-bold">What is a Risk?</h3>
      <p className="mt-2">
        Risks are identified vulnerabilities or threats found during the
        scanning process, categorized by their severity.
      </p>
      <ul className="mt-2 list-disc list-inside">
        <li>Vulnerabilities: CVE-2023-12345, SQL injection</li>
        <li>Threats: exposed admin interfaces, weak passwords</li>
      </ul>
      <p className="mt-2">
        We provide detailed reports on identified risks to help you prioritize
        and mitigate them effectively.
      </p>
    </>
  ),
  jobs: (
    <>
      <h3 className="text-lg font-bold">What is a Job?</h3>
      <p className="mt-2">
        Jobs are the tasks and processes performed by the platform, such as
        scanning, analyzing, and reporting.
      </p>
      <ul className="mt-2 list-disc list-inside">
        <li>Scanning: Running a security scan on an asset</li>
        <li>Analyzing: Evaluating the results of a scan</li>
        <li>Reporting: Generating a risk report</li>
      </ul>
      <p className="mt-2">
        Jobs help ensure that your attack surface is continuously monitored and
        assessed for potential risks.
      </p>
    </>
  ),
};

interface CountsProps {
  stats: Statistics;
  status?: QueryStatus;
}

const Counts: React.FC<CountsProps> = ({ stats, status }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    label: string;
    definition: React.ReactNode;
  }>({ label: '', definition: null });

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

  const handleInfoClick = (label: string, definition: React.ReactNode) => {
    setModalOpen(true);
    setModalContent({ label, definition });
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
                <div className="text-2xl font-semibold">
                  {count?.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-gray-600">
                    {label}
                  </span>
                </div>
              </Loader>
              <div className="text-xs font-medium flex items-center justify-between">
                <span className="block text-gray-500 text-xs">
                  {React.isValidElement(definition) &&
                  typeof definition.props?.children === 'object'
                    ? definition.props.children[1]
                    : ''}
                </span>
                <button
                  className="ml-2 text-gray-500 cursor-pointer"
                  onClick={() => handleInfoClick(label, definition)}
                >
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <Modal
        title={modalContent.label}
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="prose">{modalContent.definition}</div>
      </Modal>
    </div>
  );
};

export default Counts;
