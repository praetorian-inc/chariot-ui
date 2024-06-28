import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import MDEditor from '@uiw/react-md-editor';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Inputs } from '@/components/form/Inputs';
import { RisksIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { riskSeverityOptions } from '@/components/ui/RiskDropdown';
import { useUploadFile } from '@/hooks';
import { useCreateRisk } from '@/hooks/useRisks';
import { SearchAndSelectTypes } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';
import { RiskCombinedStatus } from '@/types';

const DEFAULT_FORM_VALUE = {
  key: '',
  name: '',
  status: 'T',
  severity: 'I',
  comment: '',
};

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

  const [isDefinitionOpen, setIsDefinitionOpen] = useState(false);
  const [definition, setDefinition] = useState('');

  const [isPOEOpen, setIsPOEOpen] = useState(false);
  const [poe, setPOE] = useState('');

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);

  const { mutateAsync: addRisk } = useCreateRisk();
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleSubmit = async () => {
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

  return (
    <>
      <Modal
        title={'Add Risk'}
        icon={<RisksIcon className="size-6 text-default-light" />}
        open={isOpen}
        onClose={onClose}
        size="xl"
        footer={{
          text: 'Add',
          form: 'addRisk',
        }}
      >
        <div className="flex flex-row flex-nowrap p-2">
          <div className="flex flex-1 flex-col space-y-4 p-2">
            <div>
              <h3 className="text-xl font-medium text-gray-700">
                What is a Risk?
              </h3>
              <p className="text-md mt-1 text-gray-500">
                A risk refers to any potential threat or vulnerability within
                your organization's IT infrastructure that could be exploited by
                attackers. Risks are identified through various security scans
                and assessments.
              </p>
            </div>
            <p className="mt-1 rounded-sm bg-layer1 p-4 text-sm text-gray-500">
              For example, if you work for Acme Corporation, a risk might
              include:
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
                <li>
                  Asset: <code className="font-extrabold">123.45.6.78</code>
                </li>
                <li>
                  Finding:{' '}
                  <code className="font-extrabold">CVE-2021-34527</code>
                </li>
                <li>
                  Severity: <code className="font-extrabold">High</code>
                </li>
              </ul>
            </p>
          </div>
          <div className="px-10 text-center">
            <div className="relative m-auto ml-4 flex h-[400px] w-full">
              <div className=" w-px bg-gray-200" />
              <div className="absolute -left-[50%] top-[50%] w-full bg-layer0 text-center text-sm text-gray-300" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center p-2">
            <form id="addRisk" onSubmit={handleSubmit} className="space-y-4">
              <SearchAndSelectTypes
                type="assets"
                value={selectedAssets}
                onChange={onSelectedAssetsChange}
                placeholder="8.8.8.8"
              />
              <Inputs
                inputs={[
                  {
                    label: 'Finding',
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
                      <div className="flex justify-around gap-2">
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
                Manually entered risks will be tracked but not automatically
                monitored.
              </p>
            </form>
          </div>
        </div>
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
