import React from 'react';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Loader } from '@/components/Loader';
import { OverflowText } from '@/components/OverflowText';
import { cn } from '@/utils/classname';

interface Props {
  title: string;
  subtitle: string;
  isLoading?: boolean;
  onClick?: () => void;
  prefix?: React.ReactNode;
  tag?: React.ReactNode;
}

export const DetailsDrawerHeader: React.FC<Props> = ({
  title,
  subtitle,
  isLoading,
  onClick,
  tag,
  prefix,
}: Props) => {
  return (
    <Loader className="h-11" isLoading={isLoading}>
      <header>
        <div className="flex items-center gap-2">
          {prefix}
          <CopyToClipboard>
            <div className="flex items-center gap-2">
              <OverflowText text={title} className="text-2xl font-extrabold" />
              {tag}
            </div>
          </CopyToClipboard>
        </div>
        {subtitle && (
          <CopyToClipboard>
            <p
              className={cn(
                'text-sm font-medium text-default-light',
                onClick && 'cursor-pointer'
              )}
              onClick={onClick}
            >
              {subtitle}
            </p>
          </CopyToClipboard>
        )}
      </header>
    </Loader>
  );
};
