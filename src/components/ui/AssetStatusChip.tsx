import { Chip, ChipProps } from '@/components/Chip';
import { AssetStatus } from '@/types';

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
