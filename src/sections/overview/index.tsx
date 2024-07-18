import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Inputs, Values } from '@/components/form/Inputs';
import { Link } from '@/components/Link';
import { Loader } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { useModifyAccount } from '@/hooks/useAccounts';
import { useIntegration } from '@/hooks/useIntegration';
import {
  Integrations,
  IntegrationsByCategory,
} from '@/sections/overview/Integration';
import { Modules, useGetModules } from '@/sections/overview/Module';
import { Tabs } from '@/sections/overview/Tab';
import { useGlobalState } from '@/state/global.state';
import {
  Account,
  AccountMetadata,
  IntegrationMeta,
  LinkAccount,
  Module,
} from '@/types';
import { getRoute } from '@/utils/route.util';

export function Overview() {
  const {
    modal: { integration },
  } = useGlobalState();

  const modules = useGetModules();

  const size = 150;

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
          <p className="ml-6">
            My
            <span className="text-gray-400"> Chariot</span>
          </p>
        </h6>
        <p className="m-auto mb-20 w-2/3 text-center text-gray-300">
          Proactively identify and address exploitable vulnerabilities in your
          organization with our comprehensive suite of cybersecurity solutions.
          From point-in-time assessments to our continuous managed security
          offering, experience the Praetorian difference.
        </p>
      </div>
      <div className="mb-10 flex justify-center gap-5">
        {Object.entries(modules).map(([moduleKey, module], index) => {
          return (
            <div key={index} className="relative w-full">
              <div className="flex flex-col gap-2 overflow-hidden rounded-md border-2 border-default bg-layer2 p-4">
                <div className="text-2xl font-bold text-default">
                  {module.label}
                </div>
                <div className="line-clamp-3 min-h-12 text-xs text-default-light">
                  {module.description}
                </div>
                {module.risks !== undefined && (
                  <div className="my-8 w-full p-2 text-center">
                    <Loader
                      className="mb-4 h-[60px]"
                      isLoading={module.status === 'pending'}
                    >
                      <p className="mb-4 text-6xl text-default">
                        {module.risks}
                      </p>
                    </Loader>
                    <p className="text-sm font-medium text-default-light">
                      Material Risks
                    </p>
                  </div>
                )}
                <Button
                  className="m-auto w-full bg-header-light text-white"
                  onClick={() => {
                    integration.onValueChange({
                      module: moduleKey as Module,
                      integration: '',
                    });
                  }}
                >
                  Manage
                </Button>
              </div>
              {module.banner && (
                <p className="items-center space-x-1 p-2 text-center text-xs text-yellow-500">
                  <ExclamationCircleIcon className="inline size-4 " />
                  <span>{module.banner}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function IntegrationsByModuleCategoryModal() {
  const {
    modal: { integration },
  } = useGlobalState();
  const [formData, setFormData] = useState<Values[]>([]);

  const { mutateAsync: unlink, status: unlinkStatus } =
    useModifyAccount('unlink');
  const { mutateAsync: link, status: linkStatus } = useModifyAccount('link');

  const { getConnectedIntegration } = useIntegration();

  function handleClose() {
    integration.onValueChange(undefined);
  }

  const selectedIntegration = useMemo(() => {
    if (integration.value?.integration) {
      const integrationMeta =
        Integrations[
          integration.value.integration as keyof typeof Integrations
        ];

      const integrations = getConnectedIntegration(integrationMeta.id);

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
    }

    return [];
  }, [integration.value?.integration, getConnectedIntegration]);

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

  async function handleAddAsset() {
    const promises = formData.map(data => link(data as unknown as LinkAccount));
    await Promise.all(promises);

    handleClose();
  }

  if (!integration.value?.module) return null;

  return (
    <Modal
      title="Integrations"
      open={Boolean(integration.value)}
      onClose={() => {
        integration.onValueChange(undefined);
      }}
      className="h-[500px] p-0"
      size="lg"
      closeOnOutsideClick={false}
      footer={{
        text: selectedIntegration.length ? 'Update' : 'Add',
        onClick: handleAddAsset,
        isLoading: linkStatus === 'pending',
        disconnect: selectedIntegration.length
          ? {
              text: 'Disconnect',
              onClick: handleDisconnect,
              isLoading: unlinkStatus === 'pending',
            }
          : undefined,
      }}
    >
      <Tabs
        tabs={Object.values(Module).map(module => {
          return {
            id: module,
            label: Modules[module].label,
            content: (
              <IntegrationTabs
                module={module}
                onClose={handleClose}
                onChange={setFormData}
              />
            ),
          };
        })}
        contentWrapperClassName="p-0 m-0"
        value={integration.value.module}
        onChange={value => {
          integration.onValueChange({
            module: value,
            integration: '',
          });
        }}
      />
    </Modal>
  );
}

function IntegrationTabs(props: {
  module: Module;
  onChange: Dispatch<SetStateAction<Values[]>>;
  onClose: () => void;
}) {
  const { module, onChange, onClose } = props;

  const {
    modal: { integration },
  } = useGlobalState();
  const { getConnectedIntegration, accountStatus } = useIntegration();
  const integrations = IntegrationsByCategory[module];

  return (
    <Tabs
      tabs={integrations.map(integration => {
        const connectedIntegration: Account[] = getConnectedIntegration(
          integration.id
        );
        const isConnected = connectedIntegration.length > 0;

        return {
          id: integration.id,
          tabClassName: 'relative',
          label: integration.id ? (
            <div className="flex min-h-[20px] items-center justify-center pl-4 pr-2">
              {isConnected && (
                <CheckCircleIcon className="absolute left-2 size-5 text-green-500" />
              )}
              {integration.logo && (
                <img
                  className="h-4"
                  src={integration.logo || ''}
                  alt={integration.name || ''}
                />
              )}
              {!integration.logo && integration.name && (
                <span>{integration.name}</span>
              )}
            </div>
          ) : (
            ''
          ),
          content: (
            <Loader type="spinner" isLoading={accountStatus === 'pending'}>
              <IntegrationTab
                connectedIntegration={connectedIntegration}
                onChange={onChange}
                integration={integration}
                onClose={onClose}
              />
            </Loader>
          ),
        };
      })}
      value={integration.value?.integration}
      onChange={value => {
        integration.onValueChange({
          module: module,
          integration: value,
        });
      }}
    />
  );
}

interface IntegrationContentProps {
  integration: IntegrationMeta;
  onChange: Dispatch<SetStateAction<Values[]>>;
  connectedIntegration: Account[];
  onClose: () => void;
}

const IntegrationTab = (props: IntegrationContentProps) => {
  const {
    integration,
    onChange: setFormData,
    connectedIntegration,
    onClose,
  } = props;
  const {
    description = '',
    markup = '',
    inputs = [],
    name = '',
    multiple = false,
    message = '',
    warning = false,
    help,
  } = integration;

  const isConnected = connectedIntegration.length > 0;
  const [count, setCount] = useState<number>(connectedIntegration.length || 1);

  const navigate = useNavigate();

  const showInputs = inputs?.some(input => !input.hidden);

  useEffect(() => {
    setCount(connectedIntegration.length || 1);
  }, [connectedIntegration.length]);

  return (
    <div className="mt-4 px-4">
      <div className="flex items-center gap-2">
        {name && <h3 className="text-xl font-medium text-gray-700">{name}</h3>}
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
              onClose();
            }}
          >
            Recent Activity
          </Button>
        ) : undefined}
      </div>
      {description && (
        <p className="text-md mb-2 text-gray-500">{description}</p>
      )}
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
          <form
            id="new-asset"
            className="border-1 w-full rounded-sm border border-gray-200 p-4"
          >
            {message && <div className="mb-4 text-gray-500">{message}</div>}
            {(showInputs || markup) && (
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
          </form>
        </div>
      )}
    </div>
  );
};
