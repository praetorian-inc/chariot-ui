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
      footer={{
        text: 'Add',
        onClick: handleSubmit,
      }}
    >
      <div className="flex flex-col justify-center p-2">
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
        </form>
      </div>
    </Modal>
  );
};
