import { useEffect, useState } from 'react';

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
  onStatusChange: (data: { status: RiskStatus; comment?: string }) => void;
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
  const [closingComment, setClosingComment] = useState('');

  useEffect(() => {
    return () => {
      setClosingComment('');
    };
  }, [isOpen]);

  return (
    <Modal title="Select Reason" open={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {riskClosedStatusList.map((riskClosedStatus, index) => (
          <label
            key={index}
            className="flex cursor-pointer items-center rounded-lg bg-layer2 p-3 transition duration-150 ease-in-out hover:bg-gray-100"
            onClick={() => {
              onStatusChange({
                status: riskClosedStatus.value as unknown as RiskStatus,
                comment: closingComment,
              });
              onClose();
            }}
          >
            <input
              type="radio"
              name="closedSubState"
              value={riskClosedStatus.value}
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
