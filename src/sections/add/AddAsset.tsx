import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Inputs, Values } from '@/components/form/Inputs';
import { AssetsIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { TabWrapper } from '@/components/ui/TabWrapper';
import { useModifyAccount } from '@/hooks';
import { useCreateAsset } from '@/hooks/useAssets';
import { useIntegration } from '@/hooks/useIntegration';
import { useGlobalState } from '@/state/global.state';
import {
  Account,
  AccountMetadata,
  Asset,
  AssetStatus,
  AssetStatusLabel,
  IntegrationType,
  LinkAccount,
} from '@/types';
import {
  IntegrationMeta,
  IntegrationsMeta,
} from '@/utils/availableIntegrations';
import { getRoute } from '@/utils/route.util';

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
        <ul className="my-0 list-disc pl-5 text-sm marker:text-gray-300 ">
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
        label: 'Priority',
        value: AssetStatus.Active,
        type: Input.Type.SELECT,
        placeholder: 'Select Priority',
        name: 'status',
        options: [
          {
            label: AssetStatusLabel[AssetStatus.ActiveHigh],
            value: AssetStatus.ActiveHigh,
          },
          {
            label: AssetStatusLabel[AssetStatus.Active],
            value: AssetStatus.Active,
          },
          {
            label: AssetStatusLabel[AssetStatus.ActiveLow],
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

  // Modify selectedIntegration.config object values if they are empty to a series of asterisks
  const selectedIntegration = useMemo(() => {
    if (selectedIndex === 0) return [];

    const integrations = getConnectedIntegration(Tabs[selectedIndex].name);
    return integrations.map(integration => {
      if (integration.config) {
        Object.keys(integration.config).forEach((key: string) => {
          if (integration.config[key as keyof AccountMetadata] === '') {
            integration.config[key as keyof AccountMetadata] = '********';
          }
        });
      }
      return integration;
    });
  }, [selectedIndex]);

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
        disconnect: selectedIntegration.length
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
            return (
              <TabWrapper key={id} vertical={true}>
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
                  {selectedIndex === index && (
                    <ChevronRightIcon className="absolute right-0 size-4" />
                  )}
                </div>
              </TabWrapper>
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
                onCancel={onClose}
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
  onCancel: () => void;
}

export const TabPanelContent = (props: TabPanelContentProps) => {
  const { tab, onChange, connectedIntegration, onCancel } = props;
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
  const navigate = useNavigate();

  const showInputs = inputs?.some(input => !input.hidden);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  useEffect(() => {
    setCount(connectedIntegration.length || 1);
  }, [connectedIntegration.length]);

  return (
    <TabPanel className="mt-4 px-4">
      <div className="flex items-center gap-2">
        {logo && (
          <h3 className="text-xl font-medium text-gray-700">{displayName}</h3>
        )}
        {isConnected && <CheckCircleIcon className="size-6 text-green-500" />}
        {isConnected ? (
          <Button
            styleType="text"
            className="ml-auto underline"
            onClick={() => {
              navigate({
                pathname: getRoute(['app', 'jobs']),
                search: `?hashSearch=${encodeURIComponent(`#${connectedIntegration[0].member}`)}`,
              });
              onCancel();
            }}
          >
            Recent Activity
          </Button>
        ) : undefined}
      </div>
      {description && (
        <p className="text-md mb-2 text-gray-500">{description}</p>
      )}
      {tab.help && (
        <div className="mb-2 rounded-lg bg-gray-100 p-4">
          <p className="mb-2 text-sm font-bold">Need help?</p>
          <div className="flex flex-col space-y-2">
            <a
              href={tab.help.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:underline"
            >
              <InformationCircleIcon className="size-5" />
              <span>{tab.help.label}</span>
            </a>
          </div>
        </div>
      )}
      <div className="mt-4 flex">
        <form
          id="new-asset"
          className="border-1 w-full rounded-sm border border-gray-200 p-4"
        >
          {message && <div className="mb-4 text-gray-500">{message}</div>}
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
                          (
                            connectedIntegration[index]?.config as Record<
                              string,
                              string
                            >
                          )?.[input.name] ||
                          connectedIntegration[index]?.[
                            input.name as keyof LinkAccount
                          ] ||
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
