import React, { FormEvent, useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import MDEditor from '@uiw/react-md-editor';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Inputs, Values } from '@/components/form/Inputs';
import { RisksIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { riskSeverityOptions } from '@/components/ui/RiskDropdown';
import { useModifyAccount, useUploadFile } from '@/hooks';
import { useIntegration } from '@/hooks/useIntegration';
import { useCreateRisk } from '@/hooks/useRisks';
import { TabPanelContent } from '@/sections/add/AddAsset';
import { SearchAndSelectTypes } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';
import {
  Account,
  IntegrationType,
  LinkAccount,
  RiskCombinedStatus,
} from '@/types';
import {
  IntegrationMeta,
  IntegrationsMeta,
} from '@/utils/availableIntegrations';
import { cn } from '@/utils/classname';

const DEFAULT_FORM_VALUE = {
  key: '',
  name: '',
  status: 'T',
  severity: 'I',
  comment: '',
};
const Tabs: IntegrationMeta[] = IntegrationsMeta.filter(({ types }) =>
  types?.includes(IntegrationType.Workflow)
);

export const AddRisks = () => {
  const {
    modal: {
      risk: {
        open: isOpen,
        onOpenChange,
        selectedAssets,
        onSelectedAssetsChange,
      },
    },
  } = useGlobalState();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [isDefinitionOpen, setIsDefinitionOpen] = useState(false);
  const [definition, setDefinition] = useState('');

  const [isPOEOpen, setIsPOEOpen] = useState(false);
  const [poe, setPOE] = useState('');

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);
  const [integrationFormData, setIntegrationFormData] = useState<Values[]>([]);
  const { mutate: link } = useModifyAccount('link');
  const { mutate: unlink, status: unlinkStatus } = useModifyAccount('unlink');

  const { mutateAsync: addRisk } = useCreateRisk();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { isIntegrationConnected, getConnectedIntegration } = useIntegration();

  const selectedIntegration =
    selectedIndex > 0
      ? getConnectedIntegration(Tabs[selectedIndex - 1].name)
      : [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPromise: Promise<any>[] = selectedAssets?.flatMap(asset => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const api: Promise<any>[] = [
        addRisk({
          ...formData,
          key: asset.key,
          status:
            `${formData.status}${formData.severity}` as RiskCombinedStatus,
        }),
      ];

      if (poe) {
        api.push(
          uploadFile({
            ignoreSnackbar: true,
            name: `${asset.dns}/${formData.name}`,
            content: poe,
          })
        );
      }

      return api;
    });

    if (definition) {
      allPromise.push(
        uploadFile({
          ignoreSnackbar: true,
          name: `definitions/${formData.name}`,
          content: definition,
        })
      );
    }

    await Promise.all(allPromise);

    onClose();
  };

  function onClose() {
    onOpenChange(false);
    setSelectedIndex(0);
  }

  function cleanUp() {
    onSelectedAssetsChange([]);
    setFormData(DEFAULT_FORM_VALUE);
    setIsDefinitionOpen(false);
    setIsPOEOpen(false);
    setPOE('');
    setDefinition('');
  }

  useEffect(() => {
    if (isOpen) {
      return () => {
        cleanUp();
      };
    }
  }, [isOpen]);

  async function handleConfigureIntegration() {
    integrationFormData.map(data => link(data as unknown as LinkAccount));
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
    <>
      <Modal
        className="h-[72vh]"
        title="Configure Risks"
        icon={<RisksIcon className="size-6 text-default-light" />}
        open={isOpen}
        onClose={onClose}
        size="lg"
        closeOnOutsideClick={false}
        footer={{
          onClick:
            selectedIndex === 0 ? () => null : handleConfigureIntegration,
          text: selectedIndex === 0 ? 'Add' : 'Configure',
          form: selectedIndex === 0 ? 'addRisk' : undefined,

          secondary: selectedIntegration.length
            ? {
                text: 'Disconnect',
                onClick: handleDisconnect,
                isLoading: unlinkStatus === 'pending',
              }
            : undefined,
        }}
      >
        <TabGroup className="flex h-full gap-6" onChange={setSelectedIndex}>
          <TabList className="border-1 w-44 shrink-0 overflow-auto border border-y-0 border-l-0 border-layer1 p-1 pr-4">
            <Tab
              className={cn(
                'relative w-full py-4 px-2 text-sm font-semibold leading-5 hover:bg-gray-50 focus:outline-0 border-b-2 border-gray-100 bg-layer0',
                selectedIndex === 0 && 'bg-layer1'
              )}
            >
              <div className="relative flex items-center justify-center">
                Add Risk
                {selectedIndex === 0 && (
                  <ChevronRightIcon className="absolute right-0 size-4" />
                )}
              </div>
            </Tab>
            {Tabs.map(({ id, displayName, logo, connected, name }, index) => {
              const isConnected = connected && isIntegrationConnected(name);
              const selected = index + 1 === selectedIndex;
              return (
                <Tab
                  key={'tab-' + id}
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
            <TabPanel>
              <div>
                <div className="flex flex-1 flex-col space-y-4">
                  <div>
                    <h3 className="mt-4 text-xl font-medium text-gray-700">
                      What is a Risk?
                    </h3>
                    <p className="text-md text-gray-500">
                      Any exploitable threat or vulnerability in your IT
                      infrastructure.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-1 flex-col justify-center">
                  <form
                    id="addRisk"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <SearchAndSelectTypes
                      label="Select Assets"
                      types={['assets']}
                      value={{ assets: selectedAssets }}
                      onChange={updatedValue => {
                        onSelectedAssetsChange(updatedValue.assets || []);
                      }}
                      placeholder="8.8.8.8"
                    />
                    <Inputs
                      inputs={[
                        {
                          label: 'Risk Name',
                          value: '',
                          placeholder: 'CVE-2021-1234',
                          name: 'name',
                          required: true,
                        },
                        {
                          label: 'Severity',
                          name: 'severity',
                          value: 'I',
                          options: riskSeverityOptions,
                          type: Input.Type.SELECT,
                        },
                        {
                          label: 'Comment',
                          name: 'comment',
                          value: '',
                          placeholder: 'Add some optional comments',
                          type: Input.Type.TEXT_AREA,
                        },
                        {
                          name: '',
                          value: '',
                          children: (
                            <div className="flex justify-around">
                              <Button
                                startIcon={<PlusIcon className="size-5" />}
                                styleType="textPrimary"
                                label="Proof of Exploit"
                                onClick={() => setIsPOEOpen(true)}
                              />
                              <Button
                                startIcon={<PlusIcon className="size-5" />}
                                styleType="textPrimary"
                                label="Description & Remediation"
                                onClick={() => setIsDefinitionOpen(true)}
                              />
                            </div>
                          ),
                        },
                      ]}
                      onChange={values =>
                        setFormData(formData => ({ ...formData, ...values }))
                      }
                    />
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Manually entered risks will be tracked but not
                      automatically monitored.
                    </p>
                  </form>
                </div>
              </div>
            </TabPanel>
            {Tabs.map(tab => {
              const connectedIntegration: Account[] = getConnectedIntegration(
                tab.name
              );
              return (
                <TabPanelContent
                  connectedIntegration={connectedIntegration}
                  key={tab.id}
                  onChange={setIntegrationFormData}
                  tab={tab}
                />
              );
            })}
          </TabPanels>
        </TabGroup>
        <AddDefinition
          open={isDefinitionOpen}
          onOpenChange={setIsDefinitionOpen}
          value={definition}
          onValueChange={setDefinition}
        />
        <AddProofOfExploit
          open={isPOEOpen}
          onOpenChange={setIsPOEOpen}
          value={poe}
          onValueChange={setPOE}
        />
      </Modal>
    </>
  );
};

interface AddDefinitionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
}

function AddDefinition(props: AddDefinitionProps) {
  const [definition, setDefinition] = useState(props.value || '');

  useEffect(() => {
    if (props.open) {
      setDefinition(props.value || '');
      return () => {
        setDefinition('');
      };
    }
  }, [props.open]);

  return (
    <Modal
      size="xl"
      open={props.open}
      onClose={() => {
        props.onOpenChange(false);
      }}
      title="Description & Remediation"
      footer={{
        text: 'Save',
        onClick: async () => {
          props.onValueChange(definition);
          props.onOpenChange(false);
        },
      }}
    >
      <MDEditor
        className="markdownSelection"
        height={'60vh'}
        value={definition}
        onChange={value => {
          setDefinition(value || '');
        }}
      />
    </Modal>
  );
}

interface AddProofOfExploitProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
}

function AddProofOfExploit(props: AddProofOfExploitProps) {
  const [poe, setPoe] = useState(props.value || '');

  useEffect(() => {
    if (props.open) {
      setPoe(props.value || '');
      return () => {
        setPoe('');
      };
    }
  }, [props.open]);

  return (
    <Modal
      size="xl"
      open={props.open}
      onClose={() => {
        props.onOpenChange(false);
      }}
      title="Proof of Exploit"
      footer={{
        text: 'Save',
        onClick: async () => {
          props.onValueChange(poe);
          props.onOpenChange(false);
        },
      }}
    >
      <MDEditor
        className="markdownSelection"
        height={'60vh'}
        value={poe}
        onChange={value => {
          setPoe(value || '');
        }}
      />
    </Modal>
  );
}
