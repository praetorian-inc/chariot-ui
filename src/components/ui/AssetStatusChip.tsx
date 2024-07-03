import { Chip, ChipProps } from '@/components/Chip';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { AssetStatus } from '@/types';
import { cn } from '@/utils/classname';

export const AssetStatusChip: React.FC<{
  className?: string;
  status: AssetStatus;
}> = ({ className, status }) => {
  const chipStyle: Record<AssetStatus, ChipProps['style']> = {
    [AssetStatus.Frozen]: 'error',
    [AssetStatus.Unknown]: 'secondary',
    [AssetStatus.Active]: 'primary',
    [AssetStatus.ActiveHigh]: 'primary',
    [AssetStatus.ActiveLow]: 'primary',
  };

  const chipText = {
    [AssetStatus.Frozen]: 'Frozen',
    [AssetStatus.Unknown]: 'Unknown',
    [AssetStatus.Active]: 'Active',
    [AssetStatus.ActiveHigh]: 'Active',
    [AssetStatus.ActiveLow]: 'Active',
  };

  return (
    <Chip className={className} style={chipStyle[status]}>
      {chipText[status]}
    </Chip>
  );
};

export const AssetStatusText: React.FC<{
  className?: string;
  status: AssetStatus;
  showIcon?: boolean;
}> = ({ className, status, showIcon }) => {
  const text = {
    [AssetStatus.Frozen]: 'Paused',
    [AssetStatus.Unknown]: 'Paused',
    [AssetStatus.Active]: 'Standard Priority',
    [AssetStatus.ActiveHigh]: 'High Priority',
    [AssetStatus.ActiveLow]: 'Low Priority',
  };

  return (
    <div className={cn('flex items-center flex-row space-x-1', className)}>
      {showIcon && getAssetStatusIcon(status)} <p>{text[status]}</p>
    </div>
  );
};
