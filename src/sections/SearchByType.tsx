import { useEffect, useRef, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Dropdown, DropdownMenu, DropdownProps } from '@/components/Dropdown';
import { FormGroup } from '@/components/form/FormGroup';
import { InputText } from '@/components/form/InputText';
import { AssetsIcon } from '@/components/icons';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { GenericResource } from '@/types';
import { uniqByKeepLast } from '@/utils/array.util';
import { capitalize } from '@/utils/lodash.util';
import { useStorage } from '@/utils/storage/useStorage.util';

export interface SearchTypeProps {
  types: (keyof GenericResource)[];
  label?: string;
  onClick?: (
    type: keyof GenericResource,
    value: string,
    option: GenericResource[keyof GenericResource][number]
  ) => void;
  multiSelect?: boolean;
  value?: string[];
  placeholder?: string;
  required?: boolean;
  queryPrefix?: string;
  filterOption?: (
    option: GenericResource[keyof GenericResource][number]
  ) => boolean;
}

export function SearchByType(props: SearchTypeProps) {
  const [search, setSearch] = useState('');

  const { data: genericSearch, status: genericSearchStatus } = useGenericSearch(
    { query: `${props.queryPrefix || ''}${search}` },
    { enabled: Boolean(search) }
  );

  const genericSearchOptions: DropdownMenu['items'] = genericSearch
    ? Object.keys(genericSearch).flatMap(key => {
        const genericSearchKey = key as keyof GenericResource;

        if (!props.types.includes(genericSearchKey)) return [];

        const typeOptions = genericSearch?.[genericSearchKey]
          .filter(option => {
            return props?.filterOption ? props.filterOption(option) : true;
          })
          .slice(0, 50)
          .map(result => {
            const option = getTypeOptionFromKey(genericSearchKey, result.key);

            return {
              ...option,
              onClick: () => {
                props?.onClick?.(genericSearchKey, option.value || '', result);
              },
            };
          });

        if (typeOptions.length === 0) return [];

        return [
          { label: capitalize(genericSearchKey), type: 'label' },
          ...uniqByKeepLast(typeOptions, option => option.value || ''),
        ] as DropdownMenu['items'];
      })
    : [];

  return (
    <Select
      // multiSelect={props.multiSelect}
      value={props.value}
      search={search}
      onSearchChange={setSearch}
      options={genericSearchOptions}
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
  const fakeInput = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (fakeInput.current) {
      const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
      if (isEmpty) {
        fakeInput.current.setCustomValidity('Search and select a value');
      } else {
        fakeInput.current.setCustomValidity('');
      }
    }
  }, [JSON.stringify(value)]);

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
        className: 'max-h-[300px]',
        emptyState: props.emptyState,
      }}
      asChild
    >
      <div>
        <FormGroup label={props.label} name={props.label || ''}>
          <div className="relative">
            <input
              ref={fakeInput}
              value={Array.isArray(value) ? value.join(',') : value}
              onChange={() => {}}
              className="absolute bottom-0 h-px w-full"
              style={{ opacity: '0' }}
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

export interface TypeSearchProps
  extends Pick<
    SearchTypeProps,
    'filterOption' | 'queryPrefix' | 'placeholder' | 'types' | 'label'
  > {
  value: Partial<Record<keyof GenericResource, SearchTypeProps['value']>>;
  onChange: (updatedValue: TypeSearchProps['value']) => void;
}

export function TypeSearch(props: TypeSearchProps) {
  const [selectedTypes, setSelectedTypes] = useStorage<
    TypeSearchProps['value']
  >({ parentState: props.value, onParentStateChange: props.onChange }, {});

  return (
    <div>
      <SearchByType
        filterOption={props.filterOption}
        required
        types={props.types}
        multiSelect
        placeholder={props.placeholder}
        label={props.label}
        value={Object.values(selectedTypes).flatMap(typeOption => {
          return typeOption.map(option => option);
        })}
        onClick={(genericType, value) => {
          setSelectedTypes(prevOption => {
            if (selectedTypes?.[genericType]?.find(o => o === value)) {
              return {
                ...prevOption,
                [genericType]: prevOption?.[genericType]?.filter(o => {
                  return o !== value;
                }),
              };
            } else {
              return {
                ...prevOption,
                [genericType]: [...(prevOption?.[genericType] || []), value],
              };
            }
          });
        }}
        queryPrefix={props.queryPrefix}
      />
      <div className="flex flex-col gap-2 [&:has(*)]:pt-2">
        {Object.keys(selectedTypes).map(type => {
          const genericType = type as keyof GenericResource;
          const selectedValues = selectedTypes[genericType];

          return selectedValues?.map((value, index) => {
            return (
              <Button
                key={index}
                className="flex w-full cursor-auto justify-between"
              >
                {getTypeOptionFromKey(genericType, value).label}
                <Button
                  aria-label="CloseIcon"
                  onClick={() => {
                    setSelectedTypes(prevOption => {
                      return {
                        ...prevOption,
                        [genericType]: prevOption?.[genericType]?.filter(v => {
                          return v !== value;
                        }),
                      };
                    });
                  }}
                  className="p-0"
                  styleType="none"
                >
                  <XMarkIcon className="size-5" />
                </Button>
              </Button>
            );
          });
        })}
      </div>
    </div>
  );
}

function getTypeOptionFromKey<T extends keyof GenericResource>(
  type: T,
  key: string
): DropdownMenu['items'][number] {
  switch (type) {
    case 'assets': {
      const asset = parseKeys.assetKey(key);

      return {
        label: (
          <div className="flex items-center gap-2 overflow-hidden">
            <AssetsIcon className="size-4 flex-none text-gray-400" />
            <span className="text-nowrap">{asset.name}</span>
            <ChevronRightIcon className="size-2 flex-none shrink-0" />
            <span className="truncate text-nowrap">{asset.dns}</span>
          </div>
        ),
        value: key,
      };
    }

    case 'attributes': {
      const attribute = parseKeys.attributeKey(key);

      return {
        label: (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <span className="text-nowrap">{attribute.name}</span> {`->`}
            <span className="text-nowrap">{attribute.value}</span>
          </div>
        ),
        value: `#attribute#${attribute.name}#${attribute.value}`,
      };
    }

    default: {
      return {
        label: 'Unknown type',
        value: '',
        disabled: true,
      };
    }
  }
}

type AttributeType = 'asset' | 'risk';

export const parseKeys = {
  attributeKey(key: string): {
    name: string;
    value: string;
    attributeType: AttributeType;
    dns: string;
  } {
    const [, , name, value, attributeType, dns] = key.split('#');

    return { name, value, attributeType: attributeType as AttributeType, dns };
  },
  assetKey(key: string): {
    dns: string;
    name: string;
  } {
    const [, , dns, name] = key.split('#');

    return { dns, name };
  },
};
