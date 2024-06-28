import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Dropdown, DropdownMenu, DropdownProps } from '@/components/Dropdown';
import { FormGroup } from '@/components/form/FormGroup';
import { InputText } from '@/components/form/InputText';
import { SeverityBadge, StatusBadge } from '@/components/GlobalSearch';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { Asset, GenericResource, Risk, RiskSeverity } from '@/types';
import { depluralize } from '@/utils/depluralize.util';
import { capitalize } from '@/utils/lodash.util';
import { useStorage } from '@/utils/storage/useStorage.util';

export interface SearchTypeProps<T extends keyof GenericResource> {
  type: T;
  label?: string;
  onClick?: (type: GenericResource[T][number]) => void;
  multiSelect?: boolean;
  value?: string[];
  placeholder?: string;
  required?: boolean;
}

export function SearchByType<T extends keyof GenericResource>(
  props: SearchTypeProps<T>
) {
  const [search, setSearch] = useState('');

  const { data: genericSearch, status: genericSearchStatus } = useGenericSearch(
    { query: search },
    { enabled: Boolean(search) }
  );

  const genericSearchOptions = genericSearch
    ? Object.keys(genericSearch).flatMap(key => {
        if (props.type && props.type !== key) return [];

        const genericSearchKey = key as keyof GenericResource;

        const typeResults = genericSearch?.[genericSearchKey];
        const typeOptions = getTypeOptions<keyof GenericResource>(
          genericSearchKey,
          typeResults,
          props.onClick
        );

        return [
          { label: capitalize(genericSearchKey), type: 'label' },
          ...typeOptions,
        ] as DropdownMenu['items'];
      })
    : [];

  const options: DropdownMenu['items'] = genericSearchOptions;

  return (
    <Select
      // multiSelect={props.multiSelect}
      value={props.value}
      search={search}
      onSearchChange={setSearch}
      options={options}
      label={props.label}
      required={props.required}
      emptyState={{
        hide: !search,
        label: search
          ? genericSearchStatus === 'pending'
            ? 'Searching...'
            : 'No results found'
          : '',
      }}
      placeholder={props.placeholder}
    />
  );
}

export interface SearchAndSelectTypes<T extends keyof GenericResource> {
  placeholder?: string;
  type: T;
  value: GenericResource[T];
  onChange: (updated: GenericResource[T]) => void;
}

export function SearchAndSelectTypes<T extends keyof GenericResource>(
  props: SearchAndSelectTypes<T>
) {
  const [selectedOptions, setSelectedOptions] = useStorage<GenericResource[T]>(
    { parentState: props.value, onParentStateChange: props.onChange },
    []
  );

  return (
    <div>
      <div className="flex flex-col gap-2 [&:has(*)]:pb-2">
        {selectedOptions.map((option, index) => {
          return (
            <Button key={index} className="flex w-full justify-between">
              {getTypeOption(props.type, option).label}
              <Button
                aria-label="CloseIcon"
                onClick={() => {
                  setSelectedOptions(prevOption => {
                    return prevOption.filter(
                      selectedOption => selectedOption !== option
                    ) as GenericResource[T];
                  });
                }}
                className="p-0"
                styleType="none"
              >
                <XMarkIcon className="size-5" />
              </Button>
            </Button>
          );
        })}
      </div>
      <SearchByType
        required
        type={props.type}
        multiSelect
        placeholder={props.placeholder}
        label={depluralize(capitalize(props.type))}
        value={selectedOptions.map(option => option.key)}
        onClick={option => {
          setSelectedOptions(prevOption => {
            if (prevOption.find(o => o.key === option.key)) {
              return prevOption.filter(o => {
                return o.key !== option.key;
              }) as GenericResource[T];
            } else {
              return [...prevOption, option] as GenericResource[T];
            }
          });
        }}
      />
    </div>
  );
}

type Value<IsMultiSelect extends boolean> = IsMultiSelect extends true
  ? string[]
  : string;

interface SelectProps<IsMultiSelect extends boolean> {
  options: DropdownMenu['items'];
  label?: string;
  multiSelect?: IsMultiSelect;
  value?: Value<IsMultiSelect>;
  onChange?: (value: Value<IsMultiSelect>) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  emptyState?: DropdownProps['menu']['emptyState'];
  placeholder?: string;
  required?: boolean;
}

function Select<IsMultiSelect extends boolean>(
  props: SelectProps<IsMultiSelect>
) {
  const [search, setSearch] = useStorage(
    { parentState: props.search, onParentStateChange: props.onSearchChange },
    ''
  );
  const [value, setValue] = useStorage<Value<IsMultiSelect>>(
    {
      parentState: props.value,
      onParentStateChange: props.onChange,
    },
    (props.multiSelect ? [] : '') as Value<IsMultiSelect>
  );

  return (
    <Dropdown
      focusType="focus"
      menu={{
        items: props.options,
        multiSelect: props.multiSelect,
        value,
        onSelect: value => {
          if (props.multiSelect) {
            setValue(value as Value<IsMultiSelect>);
          } else {
            setValue(value[0] as Value<IsMultiSelect>);
          }
        },
        emptyState: props.emptyState,
      }}
      asChild
    >
      <div>
        <FormGroup label={props.label} name={props.label || ''}>
          <div className="relative">
            <input
              value={Array.isArray(value) ? value.join(',') : value}
              className="absolute bottom-0 h-px w-full"
              style={{ opacity: '0' }}
              required={props.required}
              onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                (e.target as HTMLInputElement).setCustomValidity(
                  'Search and select a value'
                );
              }}
            />
            <InputText
              name=""
              value={search}
              onChange={event => {
                setSearch(event.target.value);
              }}
              placeholder={props?.placeholder}
            />
          </div>
        </FormGroup>
      </div>
    </Dropdown>
  );
}

function getTypeOptions<T extends keyof GenericResource>(
  type: T,
  results: GenericResource[T],
  onClick?: (result: GenericResource[T][number]) => void
): DropdownMenu['items'] {
  return results.map(result => ({
    ...getTypeOption(type, result),
    onClick: () => {
      onClick?.(result as GenericResource[T][number]);
    },
  }));
}

function getTypeOption<T extends keyof GenericResource>(
  type: T,
  result: GenericResource[T][number]
): DropdownMenu['items'][number] {
  switch (type) {
    case 'assets': {
      const asset = result as Asset;

      return {
        label: (
          <div className="flex items-center gap-2 overflow-hidden">
            <AssetsIcon className="size-4 flex-none text-gray-400" />
            <span className="text-nowrap">{asset.name}</span>
            <ChevronRightIcon className="size-2 flex-none shrink-0" />
            <span className="truncate text-nowrap">{asset.dns}</span>
          </div>
        ),
        value: asset.key,
      };
    }

    case 'risks': {
      const risk = result as Risk;

      const severity = risk.status?.[1] as RiskSeverity;

      return {
        label: (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <RisksIcon className="size-4  flex-none text-gray-400" />
            <span className="text-nowrap">{risk.name}</span>
            <ChevronRightIcon className="size-2 flex-none" />
            <StatusBadge status={risk.status} />
            <SeverityBadge severity={severity} />
          </div>
        ),
        value: risk.key,
      };
    }

    default: {
      return {
        label: 'Unknown type',
        disabled: true,
      };
    }
  }
}
