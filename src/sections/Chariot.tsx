import React, { Fragment, useState } from 'react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { Inbox, Unplug } from 'lucide-react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { Inputs, Values } from '@/components/form/Inputs';
import { Tooltip } from '@/components/Tooltip';
import { useIntegration } from '@/hooks/useIntegration';
import useIntegrationCounts from '@/hooks/useIntegrationCounts';
import { Integrations } from '@/sections/overview/Module';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

const SetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedIntegration: string | null;
}> = ({ isOpen, onClose, selectedIntegration }) => {
  const integration =
    Integrations[selectedIntegration as keyof typeof Integrations];

  if (!integration) return null;

  const handleInputsChange = (values: Values) => {
    console.log('Input Values:', values);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {integration.name} Setup
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  {integration.markup ? (
                    integration.markup
                  ) : (
                    <Inputs
                      inputs={integration.inputs || []}
                      onChange={handleInputsChange}
                    />
                  )}
                </div>
                <div className="mt-4 flex flex-row justify-end space-x-1">
                  <Button
                    styleType="none"
                    onClick={onClose}
                    className="text-gray-600"
                  >
                    Setup Later
                  </Button>
                  <Button styleType="primary" onClick={onClose}>
                    Finish
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [setupIntegration, setSetupIntegration] = useState<string | null>(null);
  const { getMyIntegrations } = useIntegration();

  const currentIntegrations = getMyIntegrations();
  const results = useIntegrationCounts(currentIntegrations);

  const counts = results.map(result => result.data);

  const availableIntegrations = [
    Integrations.amazon,
    Integrations.azure,
    Integrations.gcp,
    Integrations.ns1,
    Integrations.github,
    Integrations.gitlab,
    Integrations.crowdstrike,
    Integrations.nessus,
    Integrations.slack,
    Integrations.jira,
    Integrations.zulip,
    Integrations.teams,
  ];

  const notificationsIntegrations = [
    Integrations.slack,
    Integrations.jira,
    Integrations.webhook,
    Integrations.zulip,
    Integrations.teams,
  ];
  const [selectedIntegrations, setSelectedIntegrations] = useStorage<string[]>(
    { key: 'selectedIntegrations' },
    []
  );
  const [
    selectedNotificationIntegrations,
    setSelectedNotificationIntegrations,
  ] = useStorage<string[]>({ key: 'selectedNotificationIntegrations' }, []);

  const handleSetupClick = (integrationName: string) => {
    setSetupIntegration(integrationName);
    setIsModalOpen(true);
  };

  const attackSurfaceIntegrations = availableIntegrations.map(integration => (
    <div
      key={integration.id}
      className={cn(
        ' w-[150px] resize-none rounded-md bg-white p-6 text-center',
        selectedIntegrations.includes(integration.id) && 'border-2 border-brand'
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
      <img className="mx-auto my-3 size-12" src={integration.logo} />
      <p className="text-lg font-bold">{integration.name?.split(' ')[0]}</p>
    </div>
  ));

  const notificationIntegrations = notificationsIntegrations.map(
    integration => (
      <div
        key={integration.id}
        className={cn(
          ' w-[150px] resize-none rounded-md bg-white p-6 text-center',
          selectedNotificationIntegrations.includes(integration.id) &&
            'border-2 border-brand'
        )}
        role="button"
        onClick={() => {
          if (selectedNotificationIntegrations.includes(integration.id)) {
            setSelectedIntegrations(
              selectedNotificationIntegrations.filter(
                id => id !== integration.id
              )
            );
          } else {
            setSelectedNotificationIntegrations([
              ...selectedNotificationIntegrations,
              integration.id,
            ]);
          }
        }}
      >
        <img className="mx-auto my-3 size-12" src={integration.logo} />
        <p className="text-lg font-bold">{integration.name?.split(' ')[0]}</p>
      </div>
    )
  );

  const size = 190;

  return (
    <div className="mt-7 flex flex-col text-gray-200">
      <div className="flex flex-row items-center  justify-center space-x-6 ">
        <div className="flex flex-col items-center justify-center">
          <svg
            width={size}
            height={size}
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
          <div className="flex flex-col text-left">
            <p className="text-md">
              <span className="font-bold text-white">17,000</span>{' '}
              <span className="text-gray-400">assets monitored</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-7xl font-bold">
            My
            <span className="text-gray-400"> Chariot</span>
          </p>
          <span className="mt-2 text-3xl font-bold text-white">
            Dr. Klotzenstein&apos;s Organization
          </span>
          <div className="mt-2 flex items-center">
            <a
              href="#"
              className="text-xl font-medium text-blue-400 hover:underline"
            >
              examplecompany.com
            </a>
            <PencilSquareIcon className="ml-1 size-5 stroke-[2px] text-white" />
          </div>
          <div className="mt-4 flex w-auto space-x-4">
            <Button
              styleType="none"
              className="text-md text-nowrap rounded-[4px] bg-brand-dark px-6 font-bold"
              onClick={() => setIsDrawerOpen(true)}
            >
              Build Attack Surface
            </Button>
            <Button
              styleType="none"
              className="text-md text-nowrap rounded-[4px] bg-brand-dark px-6 font-bold"
              onClick={() => setIsNotificationsDrawerOpen(true)}
            >
              Manage Risk Notifications
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto my-4 text-center">
        <p className="text-md mt-2 text-gray-500">
          We continuously test your attack surface against thousands of
          potential threats to ensure robust security. For an extra layer of
          defense, consider enhancing your protection with expert offensive
          security engineers, adding real-world pressure testing to your
          security strategy.
        </p>
      </div>
      <main className="container mx-auto mt-8 p-4">
        <div className="rounded-lg bg-[#2D3748] p-4 shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#2D3748] text-left text-sm">
              <thead>
                <tr className="h-[56px]">
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Surface</th>
                  <th className="px-4 py-2">Identifier</th>
                  <th className="px-4 py-2">Discovered Assets</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...selectedNotificationIntegrations,
                  ...selectedIntegrations,
                ].map((integration, index) => (
                  <tr
                    key={index}
                    className=" h-[56px] text-[#9CA3AF] odd:bg-[#1F2937]"
                  >
                    <td className="px-4 py-2">{getStatusIcon('warning')}</td>
                    <td className="text-md px-4 py-2 font-semibold text-white">
                      {
                        Integrations[integration as keyof typeof Integrations]
                          .name
                      }
                    </td>
                    <td className={'px-4 py-2 text-[#FFD700]'}>
                      Requires Setup
                    </td>
                    <td className="px-4 py-2">[todo]</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-row items-center justify-center">
                        <button
                          onClick={() =>
                            handleSetupClick(
                              Integrations[
                                integration as keyof typeof Integrations
                              ].id
                            )
                          }
                          className="w-[100px] rounded-sm bg-[#FFD700] px-3 py-1 text-sm font-medium text-black"
                        >
                          Setup
                        </button>
                        <Tooltip title="Remove" placement="left">
                          <button
                            onClick={() => {
                              setSelectedIntegrations(
                                selectedIntegrations.filter(
                                  id => id !== integration
                                )
                              );
                              setSelectedNotificationIntegrations(
                                selectedNotificationIntegrations.filter(
                                  id => id !== integration
                                )
                              );
                            }}
                          >
                            <XMarkIcon className="ml-2 size-6 text-white" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentIntegrations.map((integration, index) => (
                  <tr
                    key={index}
                    className=" h-[56px] text-[#9CA3AF] odd:bg-[#1F2937]"
                  >
                    <td className="px-4 py-2">{getStatusIcon('success')}</td>
                    <td className="text-md px-4 py-2 font-semibold text-white">
                      {integration.member}
                    </td>
                    <td className={cn('px-4 py-2')}>
                      {integration.value ?? '[Redacted]'}
                    </td>
                    <td className="px-4 py-2">{counts[index] ?? '-'}</td>
                    <td className="relative px-4 py-2 text-center">
                      <Tooltip title="Disconnect" placement="left">
                        <Button styleType="none" className="mx-auto">
                          <Unplug className="mr-2 size-6 text-white" />
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedIntegration={setupIntegration}
      />
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onBack={() => setIsDrawerOpen(false)}
        className={cn('w-full rounded-t-lg pb-0 shadow-lg p-6 bg-zinc-100')}
        header={''}
        skipBack={true}
        footerClassname=""
        footer={
          selectedIntegrations.length > 0 && (
            <Button
              styleType="primary"
              className="mx-20 mb-10 h-20 w-full text-xl font-bold"
              onClick={() => setIsDrawerOpen(false)}
            >
              Build Attack Surface ({selectedIntegrations.length} selected)
            </Button>
          )
        }
      >
        <div className="mx-12">
          <h1 className="mb-12 text-4xl font-extrabold">
            Which surfaces are you in?
          </h1>
          <div className="flex flex-row flex-wrap gap-4 ">
            {attackSurfaceIntegrations}
          </div>
        </div>
      </Drawer>
      <Drawer
        open={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        onBack={() => setIsNotificationsDrawerOpen(false)}
        className={cn('w-full rounded-t-lg pb-0 shadow-lg p-6 bg-zinc-100')}
        header={''}
        footerClassname=""
        skipBack={true}
        footer={
          selectedNotificationIntegrations.length > 0 && (
            <Button
              styleType="primary"
              className="mx-20 mb-10 h-20 w-full text-xl font-bold"
              onClick={() => setIsNotificationsDrawerOpen(false)}
            >
              Set Notification Channels (
              {selectedNotificationIntegrations.length} selected)
            </Button>
          )
        }
      >
        <div className="mx-12">
          <h1 className="mb-4 text-4xl font-extrabold">
            Where do you want to be notified?
          </h1>
          <p className="mb-8 text-lg text-gray-700">
            Select your notification channels for alerts. View your current
            alerts to stay updated.
          </p>
          <Button
            styleType="none"
            className="mb mx-auto mb-3 h-14 w-full rounded-md bg-white text-lg font-semibold"
            onClick={() => (window.location.href = '/app/alerts')}
          >
            <Inbox className="mr-2 size-6 text-gray-700" /> View My Current
            Alerts
          </Button>
          <div className="mb-8 flex flex-row flex-wrap gap-4">
            {notificationIntegrations}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Chariot;
