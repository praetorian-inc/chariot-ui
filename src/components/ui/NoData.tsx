import { ReactNode } from 'react';

import { HorseIcon } from '@/components/icons/Horse.icon';
import { cn } from '@/utils/classname';

export interface NoDataProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  className?: string;
}

export const NoData = ({
  icon = <HorseIcon />,
  title,
  description,
  className,
}: NoDataProps) => (
  <div className="flex h-full flex-col items-center justify-center gap-6 p-12">
    <div className="text-[240px]">{icon}</div>
    <h6 className={cn('text-3xl font-bold capitalize text-center', className)}>
      {title}
    </h6>
    {description && (
      <p className="whitespace-break-spaces text-center">{description}</p>
    )}
  </div>
);
