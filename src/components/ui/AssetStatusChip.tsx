import { Chip, ChipProps } from '@/components/Chip';
import { AssetStatus, AssetStatusLabel } from '@/types';

export const getAssetStatusProperties = (status: AssetStatus) => {
  const styles: Record<AssetStatus, ChipProps['style']> = {
    [AssetStatus.Frozen]: 'error',
    [AssetStatus.Active]: 'primary',
    [AssetStatus.ActiveHigh]: 'primary',
    [AssetStatus.ActiveLow]: 'primary',
  };

  const texts: Record<AssetStatus, string> = {
    [AssetStatus.Frozen]: 'Frozen',
    [AssetStatus.Active]: 'Active',
    [AssetStatus.ActiveHigh]: 'Active',
    [AssetStatus.ActiveLow]: 'Active',
  };

  return {
    style: styles[status],
    text: texts[status],
    detail: AssetStatusLabel[status],
  };
};

export const AssetStatusChip: React.FC<{
  className?: string;
  status: AssetStatus;
}> = ({ className, status }) => {
  const { style, text } = getAssetStatusProperties(status);

  return (
    <Chip className={className} style={style}>
      {text}
    </Chip>
  );
};
