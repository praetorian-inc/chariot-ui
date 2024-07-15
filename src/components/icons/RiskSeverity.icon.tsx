import {
  Bars2Icon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

import { RiskSeverity } from '@/types';
import { cn } from '@/utils/classname';

export const getRiskSeverityIcon = (
  severity: RiskSeverity,
  className = 'size-5'
) => {
  switch (severity) {
    case RiskSeverity.Critical:
      return <ChevronDoubleUpIcon className={cn('text-red-800', className)} />;
    case RiskSeverity.High:
      return <ChevronUpIcon className={cn('text-pink-800', className)} />;
    case RiskSeverity.Medium:
      return <Bars2Icon className={cn('text-amber-800', className)} />;
    case RiskSeverity.Low:
      return <ChevronDownIcon className={cn('text-indigo-800', className)} />;
    case RiskSeverity.Info:
    default:
      return (
        <ChevronDoubleDownIcon className={cn('border-gray-200', className)} />
      );
  }
};
