import React, { useEffect, useState } from 'react';

import { Input } from '@/components/form/Input';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { RiskSeverityOptions } from '@/components/ui/RiskDropdown';
import { useCreateRisk } from '@/hooks/useRisks';
import { RiskCombinedStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetKeys: string[];
}

export const AddRisks: React.FC<Props> = (props: Props) => {
  const { isOpen, onClose, selectedAssetKeys } = props;
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    status: 'T',
    severity: 'I',
    comment: '',
  });

  const {
    mutate: addRisk,
    status: riskStatus,
    reset: resetRiskAdded,
  } = useCreateRisk();
  const selectedRowCount = selectedAssetKeys?.length || 0;

  useEffect(() => {
    if (riskStatus === 'success') {
      setFormData({
        key: '',
        name: '',
        status: 'T',
        severity: 'I',
        comment: '',
      });
      onClose();
      resetRiskAdded();
    }
  }, [riskStatus]);

  const handleSubmit = () => {
    selectedAssetKeys?.forEach(assetKey => {
      return addRisk({
        ...formData,
        key: assetKey,
        status: `${formData.status}${formData.severity}` as RiskCombinedStatus,
      });
    });
    onClose();
  };

  return (
    <Modal
      title={`Add Risk (${selectedRowCount} asset${selectedRowCount > 1 ? 's' : ''} selected)`}
      open={isOpen}
      onClose={onClose}
      footer={{
        text: 'Add',
        onClick: handleSubmit,
      }}
    >
      <div className="flex flex-col justify-center p-2">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                options: RiskSeverityOptions,
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
