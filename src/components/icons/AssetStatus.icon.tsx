import {
  BoltIcon,
  ChevronDoubleDownIcon,
  ClockIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';

import { AssetStatus } from '@/types';

export const getAssetStatusIcon = (status: AssetStatus) => {
  switch (status) {
    case AssetStatus.Frozen:
      return <PauseIcon className="size-5" />;
    case AssetStatus.Active:
      return <ClockIcon className="size-5" />;
    case AssetStatus.ActiveHigh:
      return <BoltIcon className="size-5" />;
    case AssetStatus.ActiveLow:
      return <ChevronDoubleDownIcon className="size-5" />;
    default:
      return <PauseIcon className="size-5" />;
  }
};
