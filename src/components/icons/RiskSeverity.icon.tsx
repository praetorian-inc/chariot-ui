import {
  Bars2Icon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

import { RiskSeverity } from '@/types';
import { cn } from '@/utils/classname';
import { getLighterSeverityClass } from '@/utils/getSeverityClass.util';

export const getRiskSeverityIcon = (severity: RiskSeverity) => {
  switch (severity) {
    case RiskSeverity.Critical:
      return (
        <ChevronDoubleUpIcon
          className={cn('size-5', getLighterSeverityClass(severity))}
        />
      );
    case RiskSeverity.High:
      return (
        <ChevronUpIcon
          className={cn('size-5', getLighterSeverityClass(severity))}
        />
      );
    case RiskSeverity.Medium:
      return (
        <Bars2Icon
          className={cn('size-5', getLighterSeverityClass(severity))}
        />
      );
    case RiskSeverity.Low:
      return (
        <ChevronDownIcon
          className={cn('size-5', getLighterSeverityClass(severity))}
        />
      );
    case RiskSeverity.Info:
    default:
      return (
        <ChevronDoubleDownIcon
          className={cn('size-5', getLighterSeverityClass(severity))}
        />
      );
  }
};
