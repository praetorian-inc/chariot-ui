import { useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  Bars2Icon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';

import { Chip } from '@/components/Chip';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { Snackbar } from '@/components/Snackbar';
import { useUpdateRisk } from '@/hooks/useRisks';
import {
  Risk,
  RiskClosedStatus,
  RiskClosedStatusLongDesc,
  RiskClosedStatusLongLabel,
  RiskCombinedStatus,
  RiskSeverity,
  RiskStatus,
  RiskStatusLabel,
  SeverityDef,
} from '@/types';
import { cn } from '@/utils/classname';
import { getSeverityClass } from '@/utils/getSeverityClass.util';

interface Props {
  risk: Pick<Risk, 'status' | 'key' | 'comment'>;
  className?: string;
  type?: 'status' | 'severity';
  selectedRowsData?: Risk[];
  styleType?: 'chip';
}

const riskStatusOptions = [
  {
    label: 'Triage',
    value: RiskStatus.Triaged,
    icon: <AdjustmentsHorizontalIcon className="size-4 stroke-2" />,
  },
  {
    label: 'Open',
    value: RiskStatus.Opened,
    icon: <LockOpenIcon className="size-4 stroke-2" />,
  },
  {
    label: 'Closed',
    value: RiskStatus.Resolved,
    icon: <LockClosedIcon className="size-4 stroke-2" />,
  },
];

const riskClosedStatusList = Object.values(RiskClosedStatus).map(
  riskClosedStatus => {
    return {
      label: RiskClosedStatusLongLabel[riskClosedStatus],
      desc: RiskClosedStatusLongDesc[riskClosedStatus],
      value: riskClosedStatus,
    };
  }
);

export const riskSeverityOptions = [
  {
    label: 'Critical',
    value: 'C',
    icon: <ChevronDoubleUpIcon className="size-4 stroke-2" />,
  },
  {
    label: 'High',
    value: 'H',
    icon: <ChevronUpIcon className="size-4 stroke-2" />,
  },
  {
    label: 'Medium',
    value: 'M',
    icon: <Bars2Icon className="size-4 stroke-2" />,
  },
  {
    label: 'Low',
    value: 'L',
    icon: <ChevronDownIcon className="size-4 stroke-2" />,
  },
  {
    label: 'Info',
    value: 'I',
    icon: <ChevronDoubleDownIcon className="size-4" />,
  },
];

export const RiskDropdown: React.FC<Props> = ({
  risk,
  className,
  type = 'severity',
  selectedRowsData,
  styleType,
}: Props) => {
  const [isClosedSubStateModalOpen, setIsClosedSubStateModalOpen] =
    useState(false);
  const [selectRiskClosedStatus, setSelectRiskClosedStatus] =
    useState<RiskClosedStatus>();

  const data =
    selectedRowsData && selectedRowsData.length > 1 ? selectedRowsData : [risk];
  const { mutate: updateRisk } = useUpdateRisk();

  const generalChipClass = 'inline-flex min-h-[26px] py-1 whitespace-nowrap';

  const riskStatusKey =
    `${risk.status?.[0]}${risk.status?.[2] || ''}` as RiskStatus;
  const riskSeverityKey = risk.status?.[1] as RiskSeverity;

  const statusLabel = RiskStatusLabel[riskStatusKey] || 'Closed'; // Closed is added to handle the old statuses
  const severityLabel = SeverityDef[riskSeverityKey];

  function handleStatusChange(value: RiskCombinedStatus) {
    data.forEach(item => {
      const riskComposite = item.key.split('#');
      const finding = riskComposite[4];

      updateRisk(
        // asset.Key for POST, risk.Key for PUT
        {
          key: item.key,
          name: finding,
          status: value,
          comment: item.comment,
          showSnackbar: data.length === 1,
        },
        {
          onSuccess: () => {
            if (data.length > 1) {
              Snackbar({
                title: `${data.length} risks updated`,
                description: 'All the risks have been successfully updated.',
                variant: 'success',
              });
            }
          },
        }
      );
    });
  }

  if (styleType === 'chip') {
    return type === 'status' ? (
      <Chip className={cn(generalChipClass, className)} style="default">
        {statusLabel}
      </Chip>
    ) : (
      <Chip
        className={cn(
          generalChipClass,
          getSeverityClass(riskSeverityKey),
          className
        )}
      >
        {severityLabel}
      </Chip>
    );
  }

  if (type === 'status') {
    return (
      <>
        <Dropdown
          className={`justify-start rounded-[2px] py-1 ${className} border-1 min-w-32 border border-gray-200`}
          menu={{
            items: riskStatusOptions,
            onClick: value => {
              if (value) {
                if (value === RiskStatus.Resolved) {
                  setIsClosedSubStateModalOpen(true);
                } else {
                  const newStatus =
                    value.length === 1
                      ? `${value}${riskSeverityKey}`
                      : `${value[0]}${riskSeverityKey}${value[1]}`;

                  handleStatusChange(newStatus as RiskCombinedStatus);
                }
              }
            },
          }}
          startIcon={
            riskStatusOptions.find(option => option.value === riskStatusKey)
              ?.icon ?? <LockClosedIcon className="size-4 stroke-2" />
          }
          endIcon={<ChevronDownIcon className="size-3 text-default-light" />}
          onClick={event => event.stopPropagation()}
        >
          <div className="flex-1 text-left">{statusLabel}</div>
        </Dropdown>
        {isClosedSubStateModalOpen && (
          <Modal
            title="Select Reason"
            open={isClosedSubStateModalOpen}
            onClose={() => {
              setIsClosedSubStateModalOpen(false);
            }}
            footer={{
              text: 'Submit',
              disabled: selectRiskClosedStatus === undefined,
              onClick: () => {
                if (selectRiskClosedStatus) {
                  const newStatus =
                    selectRiskClosedStatus.length === 1
                      ? `${selectRiskClosedStatus}${riskSeverityKey}`
                      : `${selectRiskClosedStatus[0]}${riskSeverityKey}${selectRiskClosedStatus[1]}`;

                  handleStatusChange(newStatus);
                  setIsClosedSubStateModalOpen(false);
                }
              },
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Please select a reason for closing this risk. This information
                helps us understand how risks are managed and ensure appropriate
                follow-up actions.
              </p>
              {riskClosedStatusList.map((riskClosedStatus, index) => (
                <label
                  key={index}
                  className="flex cursor-pointer items-center rounded-lg bg-gray-50 p-3 transition duration-150 ease-in-out hover:bg-gray-100"
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
        )}
      </>
    );
  }

  return (
    <Dropdown
      className={`justify-between rounded-[2px] py-1 ${getSeverityClass(riskSeverityKey)} ${className} border-1 min-w-28 border pr-2`}
      menu={{
        items: riskSeverityOptions,
        onClick: value => {
          if (value) {
            const oldStatus = risk.status;
            const newStatus = `${oldStatus[0]}${value}${oldStatus[2] ?? ''}`;

            handleStatusChange(newStatus as RiskCombinedStatus);
          }
        },
      }}
      startIcon={
        riskSeverityOptions.find(option => option.value === riskSeverityKey)
          ?.icon
      }
      endIcon={<ChevronDownIcon className="size-3 text-default-light" />}
      onClick={event => event.stopPropagation()}
    >
      <div className="flex-1 text-left">{severityLabel}</div>
    </Dropdown>
  );
};

export const riskStatusFilterOptions = Object.values(RiskStatus).map(
  riskStatus => {
    return {
      label: RiskStatusLabel[riskStatus],
      value: riskStatus,
    };
  }
);
