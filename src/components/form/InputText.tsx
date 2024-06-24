import { twMerge } from 'tailwind-merge';

import {
  DEFAULT_CLASS,
  DISABLED_CLASS,
  ERROR_CLASS,
} from '@/components/form/constants';
import { InputProps, Type } from '@/components/form/Input';

// Add a missing property to the Properties interface
declare module 'csstype' {
  interface Properties {
    textSecurity?: string;
    WebkitTextSecurity?: string;
  }
}

export const InputText = (props: InputProps) => {
  const { className = '', error = '', name, type, password, ...rest } = props;
  const inputProps = {
    name,
    id: name,
    className: twMerge(
      'bg-layer0 block w-full rounded-[2px] outline-0 p-1.5 pl-3 ring-1 focus:ring-inset focus:ring-2 sm:text-sm sm:leading-6',
      DISABLED_CLASS,
      error ? ERROR_CLASS : DEFAULT_CLASS,
      className
    ),
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : name,
  };

  return type === Type.TEXT_AREA ? (
    <textarea
      rows={5}
      style={{
        textSecurity: password ? 'disc' : 'none',
        WebkitTextSecurity: password ? 'disc' : 'none',
      }}
      pattern={props?.pattern}
      {...inputProps}
      {...rest}
    />
  ) : (
    <input
      type={props.type === Type.PASSWORD ? 'password' : ''}
      pattern={props?.pattern}
      {...inputProps}
      {...rest}
    />
  );
};
