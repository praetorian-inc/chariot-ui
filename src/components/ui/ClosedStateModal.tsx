import { useState } from 'react';

import { Modal } from '@/components/Modal';
import {
  RiskClosedStatus,
  RiskClosedStatusLongDesc,
  RiskClosedStatusLongLabel,
  RiskStatus,
} from '@/types';

interface ClosedStateModal {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (data: { status: RiskStatus }) => void;
}

const riskClosedStatusList = Object.values(RiskClosedStatus).map(
  riskClosedStatus => {
    return {
      label: RiskClosedStatusLongLabel[riskClosedStatus],
      desc: RiskClosedStatusLongDesc[riskClosedStatus],
      value: riskClosedStatus,
    };
  }
);

export const ClosedStateModal = (props: ClosedStateModal) => {
  const { isOpen, onClose, onStatusChange } = props;

  const [selectRiskClosedStatus, setSelectRiskClosedStatus] =
    useState<RiskClosedStatus>();

  return (
    <Modal
      title="Select Reason"
      open={isOpen}
      onClose={onClose}
      footer={{
        text: 'Submit',
        disabled: selectRiskClosedStatus === undefined,
        onClick: () => {
          if (selectRiskClosedStatus) {
            onStatusChange({
              status: selectRiskClosedStatus as unknown as RiskStatus,
            });
            onClose();
          }
        },
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Please select a reason for closing this risk. This information helps
          us understand how risks are managed and ensure appropriate follow-up
          actions.
        </p>
        {riskClosedStatusList.map((riskClosedStatus, index) => (
          <label
            key={index}
            className="flex cursor-pointer items-center rounded-lg bg-layer2 p-3 transition duration-150 ease-in-out hover:bg-gray-100"
          >
            <input
              type="radio"
              name="closedSubState"
              value={riskClosedStatus.value}
              onChange={() =>
                setSelectRiskClosedStatus(
                  riskClosedStatus.value as RiskClosedStatus
                )
              }
              className="form-radio size-5 text-indigo-600 transition duration-150 ease-in-out"
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-gray-900">
                {riskClosedStatus.label}
              </span>
              <span className="block text-gray-500">
                {riskClosedStatus.desc}
              </span>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
};
