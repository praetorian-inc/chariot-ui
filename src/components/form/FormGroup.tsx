import React, { PropsWithChildren } from 'react';
import { ExclamationCircleIcon as ExclamationCircleIconOutline } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

import { Loader } from '@/components/Loader';
import { Tooltip } from '@/components/Tooltip';

export interface FormInfo {
  url?: string;
  text: string;
  content?: React.ReactNode;
}

interface FormGroupProps extends PropsWithChildren {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  name: string;
  info?: FormInfo;
  isLoading?: boolean;
}

export const FormGroup = (props: FormGroupProps) => {
  const {
    error = '',
    label = '',
    children,
    endIcon,
    startIcon,
    name,
    isLoading,
    info,
  } = props;
  const rightIcon = error || endIcon;
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <div className="">
      {label && (
        <div className="mb-1 flex items-center gap-1">
          <label
            htmlFor={name}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
          {info && (
            <Tooltip placement="right" title={info?.text}>
              <ExclamationCircleIconOutline
                className="size-4"
                aria-hidden="true"
                onClick={() =>
                  info.url ? window.open(info.url) : setShowInfo(info => !info)
                }
              />
            </Tooltip>
          )}
        </div>
      )}
      <div className="relative rounded-[2px] text-default-light shadow-sm">
        {startIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {startIcon}
          </div>
        )}
        {children}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {error && (
              <ExclamationCircleIcon
                className="size-5 text-red-500"
                aria-hidden="true"
              />
            )}
            {endIcon}
          </div>
        )}
        <Loader
          isLoading={isLoading}
          className="absolute left-0 top-0 size-full"
        />
      </div>
      {info && info.content && showInfo && (
        <div className={'mt-2 rounded bg-gray-200 p-2 text-sm'}>
          {info.content}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
