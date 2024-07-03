import { useEffect, useState } from 'react';
import {
  CheckIcon,
  StopIcon as UncheckedIcon,
} from '@heroicons/react/24/outline';

import { InputEvent, InputProps } from '@/components/form/Input';

export const Checkbox = (props: InputProps) => {
  const { value, onChange, name, label } = props;
  const [isChecked, setIsChecked] = useState<boolean>(value === 'true');

  useEffect(() => {
    onChange({
      target: {
        value: isChecked,
        name,
      },
    } as unknown as InputEvent);
  }, [isChecked]);

  return (
    <label className="flex gap-2">
      <input
        type="checkbox"
        id="seed"
        className="hidden"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />

      {isChecked && (
        <div className="relative">
          <UncheckedIcon
            className="size-6 border-brand text-brand"
            aria-hidden="true"
          />
          <CheckIcon className="absolute left-1.5 top-1.5 size-3 text-brand" />
        </div>
      )}

      {!isChecked && (
        <UncheckedIcon
          className="size-6 border-brand text-brand"
          aria-hidden="true"
        />
      )}
      <span className="block text-sm font-medium leading-6 text-default">
        {label}
      </span>
    </label>
  );
};
