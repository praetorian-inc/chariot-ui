import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Inputs, Values } from '@/components/form/Inputs';
import { AssetsIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { Tooltip } from '@/components/Tooltip';
import { useModifyAccount } from '@/hooks';
import { useCreateAsset } from '@/hooks/useAssets';
import { useIntegration } from '@/hooks/useIntegration';
import { useGlobalState } from '@/state/global.state';
import {
  Account,
  Asset,
  AssetStatus,
  IntegrationType,
  LinkAccount,
} from '@/types';
import {
  IntegrationMeta,
  IntegrationsMeta,
} from '@/utils/availableIntegrations';
import { cn } from '@/utils/classname';

const PUBLIC_ASSET = 'publicAsset';

const AddAssetMessage = () => (
  <div>
    <div>
      <h3 className="m-0 text-xl font-medium text-gray-700">
        What is an Asset?
      </h3>
      <p className="text-md mb-2 text-gray-500">
        Any component of your IT infrastructure at risk of cyberattacks.
      </p>
      <p className="mt-0 rounded-sm bg-layer1 p-4 text-sm text-gray-500">
        For example, at Acme Corporation, an asset could be:
        <ul className="my-0 marker:text-gray-300 list-disc pl-5 text-sm ">
          <li>
            Domains: <span className="font-semibold">acme.com</span>
          </li>
          <li>
            IP Addresses: <span className="font-semibold">8.8.8.8</span>
          </li>
          <li>
            CIDR Ranges: <span className="font-semibold">8.8.8.0/24</span>
          </li>
          <li>
            GitHub Organizations:{' '}
            <span className="font-semibold">https://github.com/acme-corp</span>
          </li>
        </ul>
      </p>
    </div>
  </div>
);

const Tabs: IntegrationMeta[] = [
  {
    id: 0,
    name: PUBLIC_ASSET,
    displayName: 'Add Asset',
    description: '',
    logo: '',
    connected: true,
    types: [IntegrationType.AssetDiscovery],
    inputs: [
      {
        name: 'username',
        value: PUBLIC_ASSET,
        hidden: true,
      },
      {
        label: 'Asset',
        value: '',
        placeholder: 'acme.com',
        name: 'asset',
        required: true,
        className: 'h-11',
      },
      {
        label: (
          <div className="flex justify-center space-x-1 text-center">
            Priority{' '}
            <Tooltip
              title={
                <div className="flex flex-col space-y-1">
                  <p>
                    <span className="font-semibold">High Priority:</span>{' '}
                    Discovers Assets, Finds Risks (Aggressive Scan)
                  </p>
                  <p>
                    <span className="font-semibold">Standard Priority:</span>{' '}
                    Discovers Assets, Finds Risks
                  </p>
                  <p>
                    <span className="font-semibold">Low Priority:</span>{' '}
                    Discovers Assets
                  </p>
                </div>
              }
            >
              <InformationCircleIcon className="size-5 text-gray-500" />
            </Tooltip>
          </div>
        ),
        value: AssetStatus.Active,
        type: Input.Type.SELECT,
        placeholder: 'Select Priority',

        name: 'status',
        options: [
          {
            label: 'High Priority',
            value: AssetStatus.ActiveHigh,
          },
          {
            label: 'Standard Priority',
            value: AssetStatus.Active,
          },
          {
            label: 'Low Priority',
            value: AssetStatus.ActiveLow,
          },
        ],
        required: true,
        className: 'h-11',
      },
    ],
    message: <AddAssetMessage />,
  },
  ...IntegrationsMeta.filter(({ types }) =>
    types?.includes(IntegrationType.AssetDiscovery)
  ),
];

export function AddAsset() {
  const {
    modal: {
      asset: { open, onOpenChange },
    },
  } = useGlobalState();
  // eslint-disable-next-line
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Values[]>([]);
  const { isIntegrationConnected, getConnectedIntegration } = useIntegration();
  const { mutateAsync: createAsset, status: creatingAsset } = useCreateAsset();
  const { mutate: link } = useModifyAccount('link');
  const { mutate: unlink, status: unlinkStatus } = useModifyAccount('unlink');

  const selectedIntegration =
    selectedIndex > 0 ? getConnectedIntegration(Tabs[selectedIndex].name) : [];

  function onClose() {
    onOpenChange(false);
    setSelectedIndex(0);
  }

  async function handleAddAsset() {
    // if domain is selected
    if (formData[0].username === PUBLIC_ASSET) {
      await createAsset({
        name: String(formData[0].asset),
        status: formData[0].status as Asset['status'],
      });
    } else {
      // if other integrations are selected
      formData.map(data => link(data as unknown as LinkAccount));
    }

    onClose();
  }

  async function handleDisconnect() {
    if (selectedIntegration.length > 0) {
      selectedIntegration.forEach(account =>
        unlink({
          username: account.member,
          member: account.member,
          config: account.config,
          value: account.value,
          key: account.key,
        })
      );
      onClose();
    }
  }

  return (
    <Modal
      title="Configure Asset Discovery"
      className="h-[60vh] px-0 pl-6"
      open={open}
      onClose={onClose}
      footer={{
        isLoading: creatingAsset === 'pending',
        text: selectedIntegration.length ? 'Update' : 'Add',
        onClick: handleAddAsset,
        secondary: selectedIntegration.length
          ? {
              text: 'Disconnect',
              onClick: handleDisconnect,
              isLoading: unlinkStatus === 'pending',
            }
          : undefined,
      }}
      size="lg"
      closeOnOutsideClick={false}
      icon={<AssetsIcon className="size-6 text-default-light" />}
    >
      <TabGroup className="flex h-full gap-6 " onChange={setSelectedIndex}>
        <TabList className="border-1 w-44 shrink-0 overflow-auto border border-y-0 border-l-0 border-layer1 p-1 pr-4">
          {Tabs.map(({ id, displayName, logo, connected, name }, index) => {
            const isConnected = connected && isIntegrationConnected(name);
            const selected = index === selectedIndex;
            return (
              <Tab
                key={id}
                className={cn(
                  'w-full py-4 px-2 text-sm font-semibold leading-5 hover:bg-gray-50 focus:outline-0 border-b-2 border-gray-100 bg-layer0',
                  selected && 'bg-layer1'
                )}
              >
                <div className="relative flex items-center justify-center">
                  {isConnected && (
                    <CheckCircleIcon className="absolute left-0 size-5 text-green-500" />
                  )}
                  {logo && (
                    <img
                      className="h-4"
                      src={logo || ''}
                      alt={displayName || ''}
                    />
                  )}
                  {!logo && displayName && <span>{displayName}</span>}
                  {selected && (
                    <ChevronRightIcon className="absolute right-0 size-4" />
                  )}
                </div>
              </Tab>
            );
          })}
        </TabList>
        <TabPanels className="size-full overflow-auto pr-6">
          {Tabs.map(tab => {
            const connectedIntegration: Account[] = getConnectedIntegration(
              tab.name
            );
            return (
              <TabPanelContent
                connectedIntegration={connectedIntegration}
                key={tab.id}
                onChange={setFormData}
                tab={tab}
              />
            );
          })}
        </TabPanels>
      </TabGroup>
    </Modal>
  );
}

interface TabPanelContentProps {
  onChange: Dispatch<SetStateAction<Values[]>>;
  tab: IntegrationMeta;
  connectedIntegration: Account[];
}

export const TabPanelContent = (props: TabPanelContentProps) => {
  const { tab, onChange, connectedIntegration } = props;
  const {
    description = '',
    markup = '',
    inputs = [],
    logo = '',
    name = '',
    displayName = '',
    multiple = false,
    message = '',
    warning = false,
  } = tab;

  const isConnected = connectedIntegration.length > 0;
  const [count, setCount] = useState<number>(connectedIntegration.length || 1);
  const [formData, setFormData] = useState<Values[]>([]);

  const showInputs = inputs?.some(input => !input.hidden);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  useEffect(() => {
    setCount(connectedIntegration.length || 1);
  }, [connectedIntegration.length]);

  return (
    <TabPanel className="mt-4">
      <div className="flex items-center gap-2">
        {logo && (
          <h3 className="text-xl font-medium text-gray-700">{displayName}</h3>
        )}
        {isConnected && <CheckCircleIcon className="size-6 text-green-500" />}
      </div>
      {description && <p className="text-md text-gray-500">{description}</p>}
      {message && <div className=" text-gray-500">{message}</div>}
      <div className="mt-4 flex">
        <form id="new-asset" className="w-full">
          <div>
            {markup && <div className="relative">{markup}</div>}
            {showInputs &&
              [...Array(count).keys()].map(index => (
                <div key={index} className="relative space-y-4">
                  {index > 0 && (
                    <Button
                      aria-label="CloseIcon"
                      className="absolute right-0 top-0"
                      onClick={() => {
                        setCount(count => count - 1);
                        setFormData(values =>
                          values.filter((_, i) => {
                            return i !== index;
                          })
                        );
                      }}
                      styleType="none"
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  )}
                  <Inputs
                    inputs={(inputs || []).map(input => ({
                      ...input,
                      value: String(
                        input.value ||
                          connectedIntegration[index]?.[
                            input.name as keyof LinkAccount
                          ] ||
                          (
                            connectedIntegration[index]?.config as Record<
                              string,
                              string
                            >
                          )?.[input.name] ||
                          ''
                      ),
                    }))}
                    onChange={newValues =>
                      setFormData(values => {
                        if (!values) {
                          return [newValues];
                        }
                        if (values.length < index || !values[index]) {
                          return [...values, newValues];
                        }

                        return values?.map((value, i) =>
                          i === index ? newValues : value
                        );
                      })
                    }
                  />
                </div>
              ))}
          </div>
          {multiple && (
            <Button
              styleType="textPrimary"
              className="!mt-0"
              endIcon={<ChevronRightIcon className="size-5" />}
              onClick={() => {
                setCount(count => count + 1);
              }}
            >
              Add Another
            </Button>
          )}
          {warning && (
            <p className="mt-5 rounded bg-yellow-100 p-2 text-sm text-yellow-600">
              <ExclamationTriangleIcon className="inline size-5 text-yellow-700" />
              {warning}
            </p>
          )}
        </form>
      </div>
      {name === PUBLIC_ASSET && (
        <p className="mt-4 rounded bg-yellow-100 p-2 text-sm text-yellow-600">
          <ExclamationTriangleIcon className="mr-2 inline size-5 text-yellow-700" />
          <a
            href="https://github.com/praetorian-inc/praetorian-cli"
            target={'_blank'}
            rel={'noreferrer'}
            className="inline p-0 text-yellow-900 no-underline"
          >
            Praetorian CLI
          </a>{' '}
          is available for bulk asset addition.
        </p>
      )}
    </TabPanel>
  );
};
