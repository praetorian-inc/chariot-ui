import React from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { FormGroup, FormInfo } from '@/components/form/FormGroup';
import { InputText } from '@/components/form/InputText';
import { Select, SelectProps } from '@/components/form/Select';

export enum Type {
  PASSWORD = 'PASSWORD',
  TEXT_AREA = 'TEXT_AREA',
  SELECT = 'SELECT',
}

export type InputEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

export interface InputProps extends SelectProps {
  className?: string;
  label?: string;
  value: string | number;
  onChange: (e: InputEvent) => void;
  type?: Type;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  required?: boolean;
  hidden?: boolean;
  info?: FormInfo;
  password?: boolean;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  pattern?: string;
  isLoading?: boolean;
}

export function Input(props: InputProps) {
  const {
    startIcon,
    className: classNameProps,
    info,
    isLoading,
    endIcon,
    ...rest
  } = props;
  const className = `${classNameProps} ${startIcon ? '!pl-10' : ''}`;

  // Allow fields and labels to be hidden
  if (props.hidden) return null;

  switch (props.type) {
    case Type.SELECT:
      return (
        <FormGroup
          {...rest}
          label={props.label}
          error={props.error}
          name={props.name}
          startIcon={startIcon}
          isLoading={isLoading}
          info={info}
          endIcon={
            endIcon ?? (
              <ChevronUpDownIcon
                className="size-5 text-gray-400"
                aria-hidden="true"
              />
            )
          }
        >
          <Select {...rest} className={className} />
        </FormGroup>
      );

    default:
      return (
        <FormGroup
          label={props.label}
          error={props.error}
          name={props.name}
          startIcon={startIcon}
          isLoading={isLoading}
          info={info}
          endIcon={endIcon}
        >
          <InputText {...rest} className={className} />
        </FormGroup>
      );
  }
}

Input.Type = Type;
