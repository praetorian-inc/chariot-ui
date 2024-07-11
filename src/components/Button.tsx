import React, { forwardRef } from 'react';

import { Loader } from '@/components/Loader';
import { cn } from '@/utils/classname';

type BaseButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export interface ButtonProps extends BaseButtonProps {
  startIcon?: React.ReactNode;
  styleType?:
    | 'primary'
    | 'text'
    | 'none'
    | 'secondary'
    | 'textPrimary'
    | 'header'
    | 'primaryLight'
    | 'error';
  endIcon?: React.ReactNode;
  label?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      styleType,
      startIcon,
      label,
      endIcon,
      className,
      children,
      type = 'button',
      isLoading,
      disabled,
      ...restProps
    } = props;

    function getClass() {
      switch (styleType) {
        case 'text':
          return 'text-default hover:bg-layer1';
        case 'textPrimary':
          return 'text-brand';
        case 'primary':
          return 'bg-brand text-layer0 shadow-sm hover:bg-brand-hover disabled:text-default';
        case 'secondary':
          return 'bg-layer0 text-default hover:bg-layer1 shadow-sm border border-default';
        case 'header':
          return 'bg-header-light font-semibold text-header shadow-sm';
        case 'primaryLight':
          return 'bg-brand/10 shadow-sm hover:bg-brand/20 text-brand';
        case 'none':
          return '';
        case 'error': {
          return 'bg-red-100 hover:bg-red-200 border border-red-500 text-red-800';
        }
        default:
          return 'bg-default-light text-default';
      }
    }

    return (
      <>
        <button
          {...restProps}
          className={cn(
            'relative ring-inset disabled:cursor-not-allowed disabled:text-default-light disabled:bg-default-light flex items-center justify-center px-4 py-3 text-sm font-medium focus:z-10 focus:outline-0 rounded-[2px] gap-2',
            getClass(),
            className
          )}
          ref={ref}
          type={type}
          disabled={isLoading || disabled}
        >
          {isLoading && (
            <div className="absolute left-0 top-0 z-10 size-full rounded-[2px] bg-layer1">
              <Loader isLoading className="size-full rounded-[2px]" />
            </div>
          )}
          {startIcon}
          {label || children}
          {endIcon}
        </button>
      </>
    );
  }
);
