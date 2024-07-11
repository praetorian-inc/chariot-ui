import {
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';

import { RiskStatus } from '@/types';

export const getRiskStatusIcon = (status: RiskStatus) => {
  switch (status) {
    case RiskStatus.Triaged:
      return <AdjustmentsHorizontalIcon className="size-5" />;
    case RiskStatus.Opened:
      return <LockOpenIcon className="size-5" />;
    case RiskStatus.Resolved:
    case RiskStatus.Rejected:
    case RiskStatus.FalsePositive:
    default:
      return <LockClosedIcon className="size-5" />;
  }
};
