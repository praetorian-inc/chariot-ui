import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Inputs, Values } from '@/components/form/Inputs';
import { Link } from '@/components/Link';
import { Loader } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { useMy } from '@/hooks';
import { useGetDisplayName, useModifyAccount } from '@/hooks/useAccounts';
import { useBulkAddAsset } from '@/hooks/useAssets';
import { useBulkAddAttributes } from '@/hooks/useAttribute';
import { Modules, useGetModuleData } from '@/sections/overview/Module';
import { Tabs } from '@/sections/overview/Tab';
import { useAuth } from '@/state/auth';
import { useGlobalState } from '@/state/global.state';
import {
  AccountMetadata,
  Integration,
  IntegrationMeta,
  LinkAccount,
  Module,
} from '@/types';
import { cn } from '@/utils/classname';
import { generateUuid } from '@/utils/uuid.util';

export function Overview() {
  const {
    modal: { module: moduleState, upgrade: upgradeState },
  } = useGlobalState();

  const { me, friend } = useAuth();
  const { data: modulesData } = useGetModuleData();
  const { data: accounts, status: accountsStatus } = useMy({
    resource: 'account',
  });

  const displayName =
    useGetDisplayName(accounts) || friend.displayName || friend.email || me;

  const size = 150;

  const featuredModules = [
    Module.ASM,
    Module.BAS,
    Module.CTI,
    Module.VM,
    Module.CPT,
  ];

  return (
    <div>
      <div className="text-header-light">
        <h6 className="mx-auto mt-10 flex items-center justify-center text-center text-7xl font-bold">
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
          <div className="ml-6 flex flex-col text-left">
            <p>
              My
              <span className="text-gray-400"> Chariot</span>
            </p>
            <Loader isLoading={accountsStatus === 'pending'}>
              <p className="mt-2 w-full text-left text-3xl">
                {displayName}&apos;s Organization
              </p>
            </Loader>
          </div>
        </h6>

        <p className="m-auto mb-20 w-2/3 text-center text-gray-300">
          Proactively identify and address exploitable vulnerabilities in your
          organization with our comprehensive suite of cybersecurity solutions.
          From point-in-time assessments to our continuous managed security
          offering, experience the Praetorian difference.
        </p>
      </div>
      <div className="mb-10 flex justify-center gap-5">
        {featuredModules.map((moduleKey, index) => {
          const module = Modules[moduleKey];
          const moduleData = modulesData[moduleKey];

          return (
            <div
              key={index}
              className={cn(
                'relative w-full',
                !moduleData.enabled && '-translate-y-4'
              )}
            >
              <div
                className={cn(
                  'flex flex-col gap-2 overflow-hidden rounded-md p-4 shadow-lg',
                  moduleData.enabled ? 'bg-white' : 'bg-gray-200'
                )}
              >
                <div className="space-between flex h-12 w-full items-center text-5xl font-bold text-default">
                  <p>{module.name}</p>
                  {moduleData.enabled &&
                    (moduleData.noOfRisk === 0 ? (
                      <CheckCircleIcon className="ml-auto block size-12 text-green-500" />
                    ) : (
                      <ExclamationCircleIcon className="ml-auto block size-12 text-red-500" />
                    ))}
                </div>
                <div className="line-clamp-3 h-10 text-sm text-default-light">
                  {module.label}
                </div>

                <div className="flex h-36  w-full flex-col items-center justify-center text-center">
                  <Loader isLoading={moduleData.isLoading}>
                    <button
                      className={cn(
                        'mb-2 text-6xl text-default',
                        moduleData.enabled && moduleData.noOfRisk > 0
                          ? 'text-brand'
                          : 'text-gray-400'
                      )}
                      onClick={() => {
                        if (!moduleData.enabled) {
                          moduleState.onValueChange({
                            module: moduleKey as Module,
                            integration: '',
                          });
                        }
                      }}
                    >
                      {moduleData.enabled ? (
                        moduleData.noOfRisk
                      ) : (
                        <LockClosedIcon className="size-16 text-gray-400" />
                      )}
                    </button>
                  </Loader>
                  <p className="text-sm font-medium text-default-light">
                    Risks
                  </p>
                </div>
                {moduleKey === Module.CPT ? (
                  <Button
                    styleType="header"
                    onClick={() => {
                      upgradeState.onOpenChange(true);
                    }}
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    className={cn('m-auto w-full')}
                    styleType={moduleData.enabled ? 'primary' : 'header'}
                    onClick={() => {
                      moduleState.onValueChange({
                        module: moduleKey as Module,
                        integration: '',
                      });
                    }}
                  >
                    {moduleData.enabled ? 'Manage' : 'Unlock'}
                  </Button>
                )}
              </div>
              {moduleData.noOfAsset > 0 && (
                <p className="items-center space-x-1 p-2 text-center text-xs text-yellow-500">
                  <ExclamationCircleIcon className="mb-0.5 inline size-4" />
                  <span>Discovered {moduleData.noOfAsset} assets</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModulesModal() {
  const {
    modal: { module: moduleState },
  } = useGlobalState();
  const { integrationsData, isLoading } = useGetModuleData();

  const [formData, setFormData] = useState<Values[]>([]);

  const { mutateAsync: unlink, status: unlinkStatus } =
    useModifyAccount('unlink');
  const { mutateAsync: link, status: linkStatus } = useModifyAccount('link');
  const { mutateAsync: createBulkAsset, status: createBulkAssetStatus } =
    useBulkAddAsset();
  const {
    mutateAsync: createBulkAttribute,
    status: createBulkAttributeStatus,
  } = useBulkAddAttributes();

  function handleClose() {
    moduleState.onValueChange(undefined);
  }

  const selectedIntegration = useMemo(() => {
    const integrationData =
      moduleState.value?.integration &&
      integrationsData[moduleState.value.integration as Integration];

    if (integrationData) {
      const accounts = integrationData.accounts;

      return accounts.map(account => {
        if (account.config) {
          Object.keys(account.config).forEach((key: string) => {
            if (account.config[key as keyof AccountMetadata] === '') {
              account.config[key as keyof AccountMetadata] = '********';
            }
          });
        }
        return account;
      });
    }

    return [];
  }, [moduleState.value?.integration]);

  async function handleDisconnect() {
    if (selectedIntegration.length > 0) {
      const promises = selectedIntegration.map(account =>
        unlink({
          username: account.member,
          member: account.member,
          config: account.config,
          value: account.value,
          key: account.key,
        })
      );

      await Promise.all(promises);
      handleClose();
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formElement = event.target as HTMLFormElement;
    const form = new FormData(formElement);

    if (moduleState.value?.integration === Integration.basAgent) {
      const basAgentValue = form.get('bas-agents') as string;
      const basAgents = Number(basAgentValue);

      if (isNaN(basAgents)) {
        return console.error('Invalid number of BAS agents');
      }

      const assets = Array(basAgents)
        .fill(0)
        .map(() => {
          return {
            name: generateUuid(),
          };
        });

      const basAssets = await createBulkAsset(assets);

      const attributes = basAssets.map(({ key }) => {
        return { key, name: 'source', value: 'bas' };
      });

      await createBulkAttribute(attributes);
    } else {
      const promises = formData.map(data =>
        link(data as unknown as LinkAccount)
      );
      await Promise.all(promises);
      handleClose();
    }
  }

  if (!moduleState.value?.module) return null;

  return (
    <Modal
      title="Integrations"
      open={Boolean(moduleState.value)}
      onClose={() => {
        moduleState.onValueChange(undefined);
      }}
      className="h-[500px] p-0"
      size="xl"
      closeOnOutsideClick={false}
      footer={
        moduleState.value?.integration &&
        !([Integration.kev, Integration.basAgent] as string[]).includes(
          moduleState.value?.integration
        )
          ? {
              text: selectedIntegration.length ? 'Update' : 'Add',
              isLoading:
                linkStatus === 'pending' ||
                createBulkAssetStatus === 'pending' ||
                createBulkAttributeStatus === 'pending',
              form: 'overviewForm',
              disconnect: selectedIntegration.length
                ? {
                    text: 'Disconnect All',
                    onClick: handleDisconnect,
                    isLoading: unlinkStatus === 'pending',
                  }
                : undefined,
            }
          : {}
      }
    >
      <Loader isLoading={isLoading} type="spinner">
        <form id="overviewForm" className="h-full" onSubmit={handleSubmit}>
          <Tabs
            tabs={Object.values(Module).map((module, index) => {
              const isPM = index === 0;

              // If PM update design
              return {
                id: module,
                icon: Modules[module].Icon,
                hide:
                  !Modules[module].defaultTab &&
                  Modules[module].integrations.length === 0,
                label: (
                  <div className="flex flex-col text-left">
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        isPM && 'text-xl font-extrabold'
                      )}
                    >
                      {Modules[module].name}
                    </p>
                    {!isPM && (
                      <p className="text-xs text-gray-500">
                        {Modules[module].label}
                      </p>
                    )}
                  </div>
                ),
                Content: ModuleComponent,
                contentProps: {
                  module: module,
                  onClose: handleClose,
                  setFormData,
                },
              };
            })}
            contentWrapperClassName="p-0 m-0"
            tabWrapperclassName="bg-gray-50"
            value={moduleState.value.module}
            onChange={value => {
              moduleState.onValueChange({
                module: value,
                integration: '',
              });
            }}
          />
        </form>
      </Loader>
    </Modal>
  );
}

function ModuleComponent(props: {
  module: Module;
  setFormData: Dispatch<SetStateAction<Values[]>>;
  onClose: () => void;
}) {
  const { module, setFormData, onClose } = props;

  const {
    modal: { module: moduleState },
  } = useGlobalState();

  const { integrationsData } = useGetModuleData();

  const Module = Modules[module];
  const integrations = Module.integrations;

  if (!moduleState.value) return null;

  return (
    <Tabs
      tabs={[
        {
          id: '',
          label: '',
          Content: () => Module.defaultTab,
        },
        ...integrations.map(integration => {
          const integrationData = integrationsData[integration.id];

          return {
            id: integration.id as string,
            label: (
              <div className={cn(`flex w-[320px] items-center h-[52px]`)}>
                {integration.logo ? (
                  <img
                    className="mr-4 size-10 object-contain"
                    src={integration.logo}
                    alt={integration.name}
                  />
                ) : (
                  <span className="mr-4 text-lg font-semibold text-gray-800">
                    {integration.name}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-800">
                    {integration.name}
                  </span>
                  <span
                    className={`text-sm font-medium ${integrationData.isConnected ? 'text-green-500' : 'text-red-500'}`}
                  ></span>
                </div>
                {integrationData.isConnected ? (
                  <CheckCircleIcon className="ml-auto size-6 text-green-500" />
                ) : (
                  <ArrowRightCircleIcon className="ml-auto size-6 text-gray-400" />
                )}
              </div>
            ),
            Content: IntegrationComponent,
            contentProps: {
              setFormData,
              integration,
              onClose: onClose,
            },
          };
        }),
      ]}
      tabWrapperclassName="bg-gray-50"
      value={moduleState.value.integration}
      onChange={integrationId => {
        moduleState.onValueChange({
          module: module,
          integration: integrationId,
        });
      }}
    />
  );
}

interface IntegrationComponentProps {
  integration: IntegrationMeta;
  setFormData: Dispatch<SetStateAction<Values[]>>;
  onClose: () => void;
}

const IntegrationComponent = (props: IntegrationComponentProps) => {
  const { integration, setFormData } = props;

  const {
    markup = '',
    inputs = [],
    name = '',
    multiple = false,
    message = '',
    warning = false,
    help,
    customIntegration,
  } = integration;

  const { integrationsData } = useGetModuleData();

  const integrationData = integrationsData[integration.id];

  const connectedIntegration = integrationData.accounts;

  const isConnected = integrationData.isConnected;
  const [count, setCount] = useState<number>(connectedIntegration.length || 1);

  const showInputs = inputs.length > 0;

  useEffect(() => {
    setCount(connectedIntegration.length || 1);
  }, [connectedIntegration.length]);

  if (customIntegration) {
    return customIntegration;
  }

  return (
    <div className="mt-4 w-full px-4">
      <div className="flex min-h-11 items-center gap-2">
        {name && <h3 className="text-xl font-medium text-gray-700">{name}</h3>}
        {isConnected && <CheckCircleIcon className="size-6 text-green-500" />}
      </div>

      {help && (
        <div className="mb-2 rounded-lg bg-gray-100 p-4">
          <p className="mb-2 text-sm font-bold">Need help?</p>
          <div className="flex flex-col space-y-2">
            <Link
              styleType="textPrimary"
              to={help.href}
              target="_blank"
              rel="noopener noreferrer"
              buttonClass="p-0 hover:underline"
            >
              <InformationCircleIcon className="size-5" />
              <span>{help.label}</span>
            </Link>
          </div>
        </div>
      )}
      {(showInputs || message || markup || warning) && (
        <div className="mt-4 flex">
          <div className="border-1 w-full rounded-sm border border-gray-200 p-4">
            {message && <div className="mb-4 text-gray-500">{message}</div>}
            {(showInputs || markup) && (
              <div>
                {markup && <div>{markup}</div>}
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
            )}
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
          </div>
        </div>
      )}
    </div>
  );
};
