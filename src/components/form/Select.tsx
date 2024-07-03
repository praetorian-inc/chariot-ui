import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

import {
  DEFAULT_CLASS,
  DISABLED_CLASS,
  ERROR_CLASS,
} from '@/components/form/constants';
import { InputEvent, InputProps } from '@/components/form/Input';
import { Link } from '@/components/Link';
import { useOnScreen } from '@/hooks';

export interface Option {
  value: number | string;
  label: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface SelectProps {
  options?: Option[];
}

export const Select = (props: InputProps & SelectProps) => {
  const {
    className,
    error,
    placeholder,
    disabled,
    options: optionsProps = [],
    value: defaultValue,
    onChange,
    name,
  } = props;
  const selectedOption = optionsProps.find(
    option => option.value === defaultValue
  );

  const [options, setOptions] = useState<Option[]>(optionsProps);
  const [value, setValue] = useState(selectedOption?.label || defaultValue);
  const [selected, setSelected] = useState<Option>(
    selectedOption ?? optionsProps[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(0);

  function handleKeyEvent(event: React.KeyboardEvent<HTMLInputElement>) {
    const key = event.key;
    if (key === 'Enter') {
      if (isOpen && hoverIndex !== -1) {
        setSelected(options[hoverIndex]);
      }
      setIsOpen(!isOpen);
    } else if (key === 'ArrowUp') {
      setHoverIndex(prev => (prev === 0 ? options.length - 1 : prev - 1));
    } else if (key === 'ArrowDown') {
      setHoverIndex(prev => (prev === options.length - 1 ? 0 : prev + 1));
    } else if (key === 'Escape') {
      setIsOpen(false);
    }
  }

  function handleSelect(option: Option) {
    setSelected(option);
    setIsOpen(false);
    onChange({
      target: {
        value: String(option.value),
        name,
      },
    } as InputEvent);
  }

  function handleChange(event: InputEvent) {
    const value = event.target.value;
    const filteredOptions = optionsProps.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setOptions(filteredOptions);
    setValue(value);
    setIsOpen(true);
    onChange(event);
  }

  useEffect(() => {
    setHoverIndex(0);
  }, [options]);

  useEffect(() => {
    if (selected) {
      setValue(selected.label);
      setOptions(optionsProps);
    }
  }, [selected]);

  return (
    <>
      <input
        name={name}
        id={name}
        className={`block w-full rounded-[2px] bg-layer0 p-1.5 pl-3 outline-0 ring-1 hover:cursor-pointer focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${DISABLED_CLASS} ${error ? ERROR_CLASS : DEFAULT_CLASS} ${className}`}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : name}
        onClick={() => setIsOpen(!isOpen)}
        onKeyUp={event => handleKeyEvent(event)}
        onBlur={() => setIsOpen(false)}
        tabIndex={0}
        onChange={handleChange}
      />
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[2px] bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          aria-orientation="vertical"
          id="select-options"
          tabIndex={-1}
          role="listbox"
        >
          {options.map(({ label, value }, index) => {
            const isSelected = selected.value === value;
            const isHovered = hoverIndex === index;

            return options[index].divider ? (
              <div className="my-1 w-full border-t border-gray-100" />
            ) : (
              <SelectItem
                key={value}
                label={label}
                value={value}
                isSelected={isSelected}
                isHovered={isHovered}
                index={index}
                handleSelect={handleSelect}
                setHoverIndex={setHoverIndex}
                disabled={options[index].disabled}
              />
            );
          })}
        </ul>
      )}
    </>
  );
};

interface SelectItemProps {
  label: string;
  value: number | string;
  isSelected: boolean;
  isHovered: boolean;
  index: number;
  handleSelect: (option: Option) => void;
  setHoverIndex: (index: number) => void;
  disabled?: boolean;
}

const SelectItem = (props: SelectItemProps) => {
  const {
    label,
    value,
    isSelected,
    isHovered,
    index,
    handleSelect,
    setHoverIndex,
    disabled,
  } = props;
  const ref = useRef<HTMLLIElement>(null);
  const isVisible = useOnScreen(ref);

  if (!isVisible && isHovered) {
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  const isLink = typeof value === 'string' && value.startsWith('http');

  if (isLink) {
    return (
      <li className="-ml-1">
        <Link to={value as string} className="block truncate">
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li
      className={`relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 ${isHovered ? 'cursor-pointer bg-primary text-white' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      role="menuitem"
      aria-haspopup="true"
      tabIndex={0}
      key={value}
      aria-selected={isSelected}
      data-hovered={isHovered}
      onMouseDown={event => {
        event.stopPropagation();
        !disabled && handleSelect({ label, value });
      }}
      onMouseOver={() => !disabled && setHoverIndex(index)}
      ref={ref}
    >
      <span className={`${isSelected ? 'font-semibold' : ''}  block truncate`}>
        {label}
      </span>
      {isSelected && (
        <span className=" absolute inset-y-0 right-0 flex items-center pr-4 hover:text-white">
          <CheckIcon className="size-5" aria-hidden="true" />
        </span>
      )}
    </li>
  );
};
