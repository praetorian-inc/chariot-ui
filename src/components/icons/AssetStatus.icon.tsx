import { AssetStatus } from '@/types';
import { PauseIcon, ClockIcon, BoltIcon } from '@heroicons/react/24/outline';

export const getAssetStatusIcon = (status: AssetStatus) => {
  switch (status) {
    case AssetStatus.Frozen:
    case AssetStatus.Unknown:
      return <PauseIcon className="size-5" />;
    case AssetStatus.Active:
      return <ClockIcon className="size-5" />;
    case AssetStatus.ActiveHigh:
      return <BoltIcon className="size-5" />;
    default:
      return <PauseIcon className="size-5" />;
  }
};
