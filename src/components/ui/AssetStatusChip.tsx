import { Chip, ChipProps } from '@/components/Chip';
import { AssetStatus } from '@/types';
import { BoltIcon, ClockIcon, PauseIcon } from '@heroicons/react/24/outline';
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
  };

  const chipText = {
    [AssetStatus.Frozen]: 'Frozen',
    [AssetStatus.Unknown]: 'Unknown',
    [AssetStatus.Active]: 'Active',
    [AssetStatus.ActiveHigh]: 'Active',
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
  const icons = {
    [AssetStatus.Frozen]: <PauseIcon className="size-5" />,
    [AssetStatus.Unknown]: <PauseIcon className="size-5" />,
    [AssetStatus.Active]: <ClockIcon className="size-5" />,
    [AssetStatus.ActiveHigh]: <BoltIcon className="size-5" />,
  };
  const text = {
    [AssetStatus.Frozen]: 'Paused',
    [AssetStatus.Unknown]: 'Paused',
    [AssetStatus.Active]: 'Standard Priority',
    [AssetStatus.ActiveHigh]: 'High Priority',
  };

  return (
    <div className={cn('flex items-center flex-row space-x-1', className)}>
      {showIcon && icons[status]} <p>{text[status]}</p>
    </div>
  );
};
