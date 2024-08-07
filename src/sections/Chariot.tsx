import React, { useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { Integrations } from '@/sections/overview/Module';
import { cn } from '@/utils/classname';

const integrations = [
  {
    status: 'success',
    name: 'amazon',
    identifier: '1234567890',
    assets: '10,000',
    action: '',
  },
  {
    status: 'success',
    name: 'google',
    identifier: 'praetorian-chariot-example',
    assets: '200',
    action: '',
  },
  {
    status: 'warning',
    name: 'ns1',
    identifier: 'Requires Setup',
    assets: '-',
    action: 'Setup',
  },
  {
    status: 'error',
    name: 'amazon',
    identifier: '12badaccount3456',
    assets: '12',
    action: '',
  },
  {
    status: 'success',
    name: 'companydomain.com',
    identifier: 'https://github.com/company-inc',
    assets: '12',
    action: '',
  },
  {
    status: 'success',
    name: 'github',
    identifier: 'https://github.com/company-inc',
    assets: '12',
    action: '',
  },
  {
    status: 'success',
    name: 'jira',
    identifier: 'https://company.atlassian.net',
    assets: '12',
    action: '',
  },
  {
    status: 'success',
    name: 'slack',
    identifier: 'https://hooks.slack.com/services',
    assets: '12',
    action: '',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon className="size-10 text-[#10B981] " />;
    case 'warning':
      return (
        <div className="flex size-10 items-center justify-center rounded-full bg-[#FFD700]">
          <WrenchScrewdriverIcon className="size-5 text-[#2D3748] " />
        </div>
      );
    case 'error':
      return <ExclamationTriangleIcon className="size-10 text-[#F87171] " />;
    default:
      return <div className="size-6 bg-gray-600 "></div>;
  }
};

const Chariot: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const modifiedIntegrations = [
    Integrations.amazon,
    Integrations.azure,
    Integrations.gcp,
    Integrations.ns1,
    Integrations.github,
    Integrations.gitlab,
    Integrations.crowdstrike,
    Integrations.hook,
    Integrations.nessus,
    Integrations.webhook,
    Integrations.slack,
    Integrations.jira,
    Integrations.zulip,
    Integrations.teams,
  ];
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    []
  );

  const allIntegrations = modifiedIntegrations.map(integration => (
    <div
      key={integration.id}
      className={cn(
        'h-[150px] w-[200px] resize-none rounded-md bg-white p-4 text-center',
        selectedIntegrations.includes(integration.id) &&
          'border border-2 border-brand'
      )}
      role="button"
      onClick={() => {
        if (selectedIntegrations.includes(integration.id)) {
          setSelectedIntegrations(
            selectedIntegrations.filter(id => id !== integration.id)
          );
        } else {
          setSelectedIntegrations([...selectedIntegrations, integration.id]);
        }
      }}
    >
      <img className="mx-auto mb-3 size-20" src={integration.logo} />
      <p className="text-lg font-bold">{integration.name?.split(' ')[0]}</p>
    </div>
  ));

  return (
    <div className="mt-7 flex flex-col text-gray-200">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center space-x-4">
          <svg
            width={150}
            height={150}
            viewBox={`0 0 74 74`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M37.0306 0C56.3771 0 72.0612 15.6872 72.0612 35.0306C72.0612 47.071 65.9842 57.693 56.7333 64C48.3901 58.9979 41.831 51.1874 40.6585 42.5101C36.8982 41.782 32.3594 41.5551 29.0373 42.5511L25.857 32.4113L30.7173 40.2565C33.4626 39.7427 36.5452 39.7364 39.7728 40.2407C38.2977 39.1722 37.371 39.0052 35.1709 38.2991C43.8041 38.2203 52.2418 46.3397 53.7642 53.7152L60.6575 53.2015L65.3948 44.9308C57.9342 37.1739 52.5349 29.1018 51.9581 21.1306L37.475 10.8174C36.7406 12.2799 36.52 13.8307 36.5704 15.4224C34.6131 12.8725 36.4727 9.39591 38.9091 4.79409C39.2937 4.03763 39.549 3.56799 37.8438 4.12273C33.1064 5.66718 29.5006 8.46609 27.392 11.5329C12.4297 18.1079 5.22128 28.1594 2.94558 37.7633L2.52322 41.0917C2.17966 39.1249 2 37.1014 2 35.0369C2 15.6872 17.684 0 37.0306 0ZM38.7925 10.975L42.2565 13.5218C42.7419 12.3997 44.0468 10.7828 45.9884 9.54405C46.6881 9.16267 46.9434 8.69934 45.2886 8.85378C42.9247 9.07126 40.2014 10.4045 38.7925 10.975ZM61.5369 48.1962L59.9483 43.3359L57.9752 43.9001L58.2179 46.3145C59.4188 44.8898 59.9231 46.6927 61.5369 48.1962ZM38.118 21.8208C41.0808 23.381 40.8665 23.8255 41.0966 26.7505L44.135 28.7173L45.919 29.1396L47.7787 31.1348C45.2697 27.1066 43.5015 23.1573 38.118 21.8208Z"
              fill={'white'}
            />
          </svg>
          <div className="flex flex-col">
            <p className="text-7xl font-bold">
              My
              <span className="text-gray-400"> Chariot</span>
            </p>
            <span className="mt-2 text-3xl font-bold text-white">
              Dr. Klotzenstein&apos;s Organization
            </span>
            <div className="mt-4 flex w-auto space-x-4">
              <Button
                styleType="none"
                className="text-md w-[200px] bg-brand-dark font-bold"
                onClick={() => setIsDrawerOpen(true)}
              >
                Build Attack Surface
              </Button>
              <div className="flex flex-col text-left">
                <div className="flex items-center">
                  <a
                    href="#"
                    className="font-medium text-blue-500 hover:underline"
                  >
                    examplecompany.com
                  </a>
                  <PencilSquareIcon className="ml-1 size-4 stroke-[2px] text-white" />
                </div>
                <p className="font-meidum text-sm text-white">
                  17,000 assets monitored
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto mt-8 p-4">
        <div className="rounded-lg bg-[#2D3748] p-4 shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#2D3748] text-left text-sm">
              <thead>
                <tr className="h-[56px]">
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Integration</th>
                  <th className="px-4 py-2">Identifier</th>
                  <th className="px-4 py-2">Discovered Assets</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((integration, index) => (
                  <tr
                    key={index}
                    className=" h-[56px] text-[#9CA3AF] odd:bg-[#1F2937]"
                  >
                    <td className="px-4 py-2">
                      {getStatusIcon(integration.status)}
                    </td>
                    <td className="text-md px-4 py-2 font-semibold text-white">
                      {integration.name}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2',
                        integration.identifier === 'Requires Setup' &&
                          'text-[#FFD700]'
                      )}
                    >
                      {integration.identifier}
                    </td>
                    <td className="px-4 py-2">{integration.assets}</td>
                    <td className="px-4 py-2 text-center">
                      {integration.action ? (
                        <button className="w-[100px] rounded-sm bg-[#FFD700] px-3 py-1 text-sm font-medium text-black">
                          {integration.action}
                        </button>
                      ) : (
                        <EllipsisVerticalIcon className="mx-auto size-6 text-gray-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onBack={() => setIsDrawerOpen(false)}
        className={cn('w-full rounded-t-lg pb-0 shadow-lg p-6 bg-zinc-100')}
        header={''}
        footerClassname=""
        footer={
          selectedIntegrations.length > 0 && (
            <Button
              styleType="primary"
              className="mx-20 mb-10 h-20 w-full text-xl font-bold"
            >
              Attach Integrations ({selectedIntegrations.length} selected)
            </Button>
          )
        }
      >
        <div className="mx-12">
          <h1 className="mb-12 text-4xl font-extrabold">
            Which surfaces are you in?
          </h1>
          <div className="flex flex-row flex-wrap gap-4 ">
            {allIntegrations}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Chariot;
