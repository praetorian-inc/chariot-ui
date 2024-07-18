import React, { ReactNode, useEffect } from 'react';

import { Input, InputEvent, InputProps } from '@/components/form/Input';
import { Option } from '@/components/form/Select';
import { useStorage } from '@/utils/storage/useStorage.util';

export type Values = Record<string, InputProps['value']>;
type InputType = Omit<InputProps, 'onChange'>;
export type InputsT = (InputType & { children?: ReactNode })[];

interface Props {
  className?: string;
  inputs: InputsT;
  onChange: (values: Values) => void;
  values?: Values;
}

export const getFormValues = (inputs: InputsT) => {
  return inputs.reduce((acc, current) => {
    if (current.children) {
      return acc;
    }
    return {
      ...acc,
      [current.name]: current.value,
    };
  }, {}) as Values;
};

export const Inputs: React.FC<Props> = (props: Props) => {
  const { className, inputs } = props;

  const [values, setValues] = useStorage(
    { parentState: props.values, onParentStateChange: props.onChange },
    getFormValues(inputs)
  );

  useEffect(() => {
    props.onChange(values);
  }, []);

  function handleChange(input: InputType) {
    return function (event: InputEvent) {
      const options: Option[] =
        input.type === Input.Type.SELECT && input.options ? input.options : [];
      const number = options.some(({ value }) => typeof value === 'number');
      const { name, value } = event.target;
      setValues(values => {
        const newValues = {
          ...values,
          [name]: number ? parseInt(value, 10) : value,
        };
        return newValues;
      });
    };
  }

  return inputs.map(input => {
    if (input.children) {
      return input.children;
    }

    return (
      <Input
        {...input}
        className={className}
        key={input.name}
        value={values[input.name]}
        onChange={handleChange(input)}
      />
    );
  });
};
