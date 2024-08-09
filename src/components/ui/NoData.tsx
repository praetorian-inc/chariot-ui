import { ReactNode } from 'react';

import { HorseIcon } from '@/components/icons/Horse.icon';
import { cn } from '@/utils/classname';

export interface NoDataProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  styleType?: 'text' | 'textWithIcon';
}

export const NoData = ({
  icon = <HorseIcon />,
  title,
  description,
  styleType = 'textWithIcon',
}: NoDataProps) => {
  const isText = styleType === 'text';
  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-6 p-12',
        isText && 'p-0 text-default-light gap-0'
      )}
    >
      {!isText && <div className="text-[240px]">{icon}</div>}
      {!isText && (
        <h6 className={'text-center text-3xl font-bold capitalize'}>{title}</h6>
      )}
      {isText && <p className="whitespace-break-spaces text-center">{title}</p>}
      {description && (
        <p className="whitespace-break-spaces text-center">{description}</p>
      )}
    </div>
  );
};
