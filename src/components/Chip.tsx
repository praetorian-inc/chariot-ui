import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends PropsWithChildren {
  onClick?: () => void;
  className?: string;
  style?: 'default' | 'primary' | 'secondary' | 'error';
}

const chipClasses = {
  default: 'bg-default-light text-default',
  primary: 'bg-brand/10 text-brand',
  secondary: 'bg-default text-default-dark',
  error: 'bg-error/10 text-error',
};

export const Chip = ({
  onClick,
  children,
  className,
  style = 'primary',
}: ChipProps) => {
  return (
    <div
      className={twMerge(
        'text-center rounded-[2px] text-xs py-1 px-2 ',
        chipClasses[style],
        className,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      tabIndex={onClick && 0}
    >
      {children}
    </div>
  );
};
