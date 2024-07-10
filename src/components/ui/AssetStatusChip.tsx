import { Chip, ChipProps } from '@/components/Chip';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { AssetStatus, AssetStatusLabel } from '@/types';
import { cn } from '@/utils/classname';

const getStatusProperties = (status: AssetStatus) => {
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
  const { style, text } = getStatusProperties(status);

  return (
    <Chip className={className} style={style}>
      {text}
    </Chip>
  );
};

export const AssetStatusText: React.FC<{
  className?: string;
  status: AssetStatus;
  showIcon?: boolean;
}> = ({ className, status, showIcon }) => {
  const { text, detail } = getStatusProperties(status);

  return (
    <div className={cn('flex items-center flex-row space-x-1', className)}>
      {text}{' '}
      {detail && (
        <div className="ml-3 flex items-center space-x-1 rounded-sm bg-gray-50 p-2 text-xs font-medium text-gray-500">
          {showIcon && getAssetStatusIcon(status)}
          <p>{detail}</p>
        </div>
      )}
    </div>
  );
};
