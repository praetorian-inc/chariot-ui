import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Inputs, Values } from '@/components/form/Inputs';
import { Loader } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { useModifyAccount } from '@/hooks/useAccounts';
import { useIntegration } from '@/hooks/useIntegration';
import {
  IntegrationMeta,
  Integrations,
  useGetIntegrationsByCategory,
} from '@/sections/overview/Integration';
import { useGetModules } from '@/sections/overview/module';
import { Tabs } from '@/sections/overview/Tab';
import { useGlobalState } from '@/state/global.state';
import { Account, AccountMetadata, LinkAccount, Modules } from '@/types';
import { getRoute } from '@/utils/route.util';

export function Overview() {
  const {
    modal: { integration },
  } = useGlobalState();

  const modules = useGetModules();

  return (
    <div className="flex gap-5">
      {Object.entries(modules).map(([moduleKey, module], index) => {
        return (
          <div
            key={index}
            className="flex h-80 w-full flex-col gap-2 overflow-hidden rounded-md border-2 border-default bg-layer2 p-2"
          >
            <div className="font-semibold text-default-light">
              {module.label}
            </div>
            <div className="font-bold text-default-dark">{module.name}</div>
            <div className="pb-8 font-medium text-default-light">
              {module.description}
            </div>
            {(module.assets !== undefined || module.risks !== undefined) && (
              <div className="flex ">
                {module.assets !== undefined && (
                  <div className="w-full p-2 text-center">
                    <p className="text-default-light">{module.assets}</p>
                    <p>Assets</p>
                  </div>
                )}
                {module.assets !== undefined && module.risks !== undefined && (
                  <div className="h-full w-px border-l-2 border-current text-default-light"></div>
                )}
                {module.risks !== undefined && (
                  <div className="w-full p-2 text-center">
                    <p className="text-default-light">{module.risks}</p>
                    <p>Risks</p>
                  </div>
                )}
              </div>
            )}

            <Button
              className="m-auto"
              onClick={() => {
                integration.onValueChange({
                  module: moduleKey as Modules,
                  integration: '',
                });
              }}
            >
              Manage
            </Button>
          </div>
        );
      })}
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

      const integrations = getConnectedIntegration(integrationMeta.name);

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
        tabs={Object.values(Modules).map(module => {
          return {
            id: module,
            label: module,
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
  module: Modules;
  onChange: Dispatch<SetStateAction<Values[]>>;
  onClose: () => void;
}) {
  const { module, onChange, onClose } = props;

  const {
    modal: { integration },
  } = useGlobalState();
  const integrationsByCategory = useGetIntegrationsByCategory();
  const { getConnectedIntegration, accountStatus } = useIntegration();
  const integrations = integrationsByCategory[module];

  return (
    <Tabs
      tabs={integrations.map(integration => {
        const connectedIntegration: Account[] = getConnectedIntegration(
          integration.name
        );
        const isConnected = connectedIntegration.length > 0;

        return {
          id: integration.name,
          tabClassName: 'relative',
          label: integration.name ? (
            <div className="flex min-h-[20px] items-center justify-center pl-4 pr-2">
              {isConnected && (
                <CheckCircleIcon className="absolute left-2 size-5 text-green-500" />
              )}
              {integration.logo && (
                <img
                  className="h-4"
                  src={integration.logo || ''}
                  alt={integration.displayName || ''}
                />
              )}
              {!integration.logo && integration.displayName && (
                <span>{integration.displayName}</span>
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
    logo = '',
    displayName = '',
    multiple = false,
    message = '',
    warning = false,
  } = integration;

  const isConnected = connectedIntegration.length > 0;
  const [count, setCount] = useState<number>(connectedIntegration.length || 1);

  const navigate = useNavigate();

  const showInputs = inputs?.some(input => !input.hidden);

  useEffect(() => {
    setCount(connectedIntegration.length || 1);
  }, [JSON.stringify(connectedIntegration)]);

  return (
    <div>
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
              onClose();
            }}
          >
            Recent Activity
          </Button>
        ) : undefined}
      </div>
      {description && (
        <p className="text-md mb-8 text-gray-500">{description}</p>
      )}
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
                      className="absolute right-0 top-[-8px]"
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
    </div>
  );
};
