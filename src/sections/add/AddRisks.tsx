import React, { useEffect, useState } from 'react';

import { Input } from '@/components/form/Input';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { riskSeverityOptions } from '@/components/ui/RiskDropdown';
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

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);

  const { mutate: addRisk } = useCreateRisk();

  const handleSubmit = async () => {
    const allRisk = selectedAssets?.map(asset => {
      return addRisk({
        ...formData,
        key: asset.key,
        status: `${formData.status}${formData.severity}` as RiskCombinedStatus,
      });
    });

    await Promise.all(allRisk);

    onClose();
  };

  function onClose() {
    onOpenChange(false);
  }

  function cleanUp() {
    onSelectedAssetsChange([]);
    setFormData(DEFAULT_FORM_VALUE);
  }

  useEffect(() => {
    if (isOpen) {
      return () => {
        cleanUp();
      };
    }
  }, [isOpen]);

  return (
    <Modal
      title={'Add Risk'}
      open={isOpen}
      onClose={onClose}
      size="xl"
      footer={{
        text: 'Add',
        onClick: handleSubmit,
      }}
    >
      <div className="flex flex-row space-y-6 p-6 flex-nowrap">
        <div className="flex-1">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              What is a Risk?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              A risk refers to any potential threat or vulnerability within your
              organization's IT infrastructure that could be exploited by
              attackers. Risks are identified through various security scans and
              assessments.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              To add a risk, you will need to provide the asset name, the
              finding name (typically a CVE identifier), the severity, and
              optionally upload proof of concept and a definition.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              For example, if you work for Acme Corporation, a risk might
              include:
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
                <li>
                  Asset Name: <code>123.45.6.78</code>
                </li>
                <li>
                  Finding Name: <code>CVE-2021-34527</code>
                </li>
                <li>
                  Severity: <code>High</code>
                </li>
              </ul>
            </p>
          </div>
        </div>
        <div className="px-10 text-center">
          <div className="relative m-auto ml-4 flex h-[400px] w-full">
            <div className=" w-px bg-gray-200" />
            <div className="absolute -left-[50%] top-[50%] w-full bg-layer0 text-center text-sm text-gray-300" />
          </div>
        </div>
        <div className="flex flex-col justify-center p-2 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              ]}
              onChange={values =>
                setFormData(formData => ({ ...formData, ...values }))
              }
            />
            <p className="mt-3 text-xs text-gray-500 text-center">
              Manually entered risks will be tracked but not automatically
              monitored.
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
};
