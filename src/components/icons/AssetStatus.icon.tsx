import {
  MagnifyingGlassCircleIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import { AssetStatus } from '@/types';

export const getAssetStatusIcon = (
  status: AssetStatus,
  className = 'size-5'
) => {
  switch (status) {
    case AssetStatus.ActiveHigh:
      return <ShieldCheckIcon className={className} />;
    case AssetStatus.Active:
      return <MagnifyingGlassCircleIcon className={className} />;
    case AssetStatus.ActiveLow:
      return <MagnifyingGlassIcon className={className} />;
    case AssetStatus.Frozen:
    default:
      return <NoSymbolIcon className={className} />;
  }
};
