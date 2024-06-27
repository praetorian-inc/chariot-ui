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
import { ClosedStateModal } from '@/components/ui/ClosedStateModal';
import { useBulkUpdateRisk } from '@/hooks/useRisks';
import {
  Risk,
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

  const updateRisk = useBulkUpdateRisk();

  const data =
    selectedRowsData && selectedRowsData.length > 1 ? selectedRowsData : [risk];

  const generalChipClass = 'inline-flex min-h-[26px] py-1 whitespace-nowrap';

  const riskStatusKey =
    `${risk.status?.[0]}${risk.status?.[2] || ''}` as RiskStatus;
  const riskSeverityKey = risk.status?.[1] as RiskSeverity;

  const statusLabel = RiskStatusLabel[riskStatusKey] || 'Closed'; // Closed is added to handle the old statuses
  const severityLabel = SeverityDef[riskSeverityKey];

  function handleStatusChange({
    status,
    severity,
  }: {
    status?: RiskStatus;
    severity?: string;
  }) {
    updateRisk({
      selectedRows: data as Risk[],
      status,
      severity,
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
          className={`justify-start rounded-[2px] py-1 ${className} border-1 min-w-32 border border-default`}
          menu={{
            items: riskStatusOptions,
            onClick: value => {
              if (value) {
                if (value === RiskStatus.Resolved) {
                  setIsClosedSubStateModalOpen(true);
                } else {
                  handleStatusChange({ status: value as RiskStatus });
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

        <ClosedStateModal
          isOpen={isClosedSubStateModalOpen}
          onClose={() => setIsClosedSubStateModalOpen(false)}
          onStatusChange={handleStatusChange}
        />
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
            handleStatusChange({ severity: value });
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
