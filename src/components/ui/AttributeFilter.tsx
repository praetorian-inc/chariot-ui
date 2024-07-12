import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { FormGroup } from '@/components/form/FormGroup';
import { InputText } from '@/components/form/InputText';
import { Popover } from '@/components/Popover';

type FormDataKeys = 'port' | 'protocol';

export const AttributeFilter = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<FormDataKeys, string[]>>({
    port: [],
    protocol: [],
  });
  const inputs = [
    {
      label: 'Port',
      value: formData.port,
      placeholder: '21',
      name: 'port',
      required: true,
      type: 'multi_select',
    },
    {
      label: 'Protocol',
      value: formData.protocol,
      placeholder: 'http',
      name: 'protocol',
      required: true,
      type: 'multi_select',
    },
  ];

  const showTags = Object.values(formData).flat().length > 0;
  const label = showTags
    ? Object.entries(formData)
        .filter(([_, value]) => value.length > 0)
        .map(([key, value]) => `${getInputLabel(key)}: ${value.join(',')}`)
        .join(', ')
    : 'Attribute';

  useEffect(() => {
    // TODO: Add api call
  }, [JSON.stringify(formData)]);

  function getInputLabel(key: string) {
    return inputs.find(({ name }) => name === key)?.label;
  }

  return (
    <Popover
      onClick={() => setOpen(!open)}
      type="button"
      open={open}
      setOpen={setOpen}
      styleType="header"
      endIcon={<ChevronDownIcon className="size-3" />}
      label={label}
      style={{ zIndex: 2 }}
    >
      <div className="w-[300px]" style={{ zIndex: 100 }}>
        <form className="flex flex-1 flex-col gap-4 p-2" onSubmit={() => null}>
          {showTags && (
            <div className="space-y-2">
              {Object.entries(formData).map(([key, values]) => (
                <>
                  {values.map(current => (
                    <div
                      key={current}
                      className="mt-0 flex items-center gap-2 bg-layer1 p-2 text-sm"
                    >
                      <span className="basis-1/3 font-medium">
                        {getInputLabel(key)}
                      </span>
                      <span>{current}</span>
                      <button
                        type="button"
                        className="ml-auto"
                        onClick={() => {
                          setFormData(formData => ({
                            ...formData,
                            [key]: formData[key as FormDataKeys].filter(
                              v => v !== current
                            ),
                          }));
                        }}
                      >
                        <XMarkIcon className="size-5" />
                      </button>
                    </div>
                  ))}
                </>
              ))}
            </div>
          )}

          {inputs.map(({ label, name, placeholder, required }) => (
            <AttributeInput
              label={label}
              name={name}
              value={formData[name as FormDataKeys] as string[]}
              onChange={values => {
                setFormData(formData => ({
                  ...formData,
                  [name]: values,
                }));
              }}
              placeholder={placeholder}
              required={required}
              key={name}
            />
          ))}
        </form>
      </div>
    </Popover>
  );
};

interface AttributeInputProps {
  label: string;
  name: string;
  value?: string[];
  placeholder: string;
  required: boolean;
  onChange: (values: string[]) => void;
}

export const AttributeInput = (props: AttributeInputProps) => {
  const { label, name, value = [], onChange, placeholder, required } = props;

  //   const [value, setValue] = useState<string[]>(defaultValue);
  const [localValue, setLocalValue] = useState<string>('');

  useEffect(() => {
    onChange(value);
  }, [value]);

  return (
    <FormGroup
      formClassName="flex justify-between gap-1"
      label={label}
      name={name}
    >
      <div className="relative">
        <input
          name={name}
          value={Array.isArray(value) ? value.join(',') : value}
          className="absolute bottom-0 h-px w-full"
          style={{ opacity: '0' }}
        />
        <InputText
          name=""
          value={localValue}
          onChange={event => {
            setLocalValue(event.target.value);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              onChange([...new Set([...value, localValue])]);
              setLocalValue('');
            }
          }}
          required={required}
          placeholder={placeholder}
        />
      </div>
    </FormGroup>
  );
};
