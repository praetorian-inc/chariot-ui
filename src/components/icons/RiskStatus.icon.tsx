import {
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';

import { RiskStatus } from '@/types';
import { cn } from '@/utils/classname';

export const getRiskStatusIcon = (status: RiskStatus, className = 'size-5') => {
  switch (status) {
    case RiskStatus.Triaged:
      return <AdjustmentsHorizontalIcon className={className} />;
    case RiskStatus.Opened:
      return <LockOpenIcon className={className} />;
    case RiskStatus.Resolved:
    case RiskStatus.Rejected:
    case RiskStatus.FalsePositive:
    default:
      return <LockClosedIcon className={cn('text-default-light', className)} />;
  }
};
