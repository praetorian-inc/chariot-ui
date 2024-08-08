import React, { useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Square } from 'lucide-react';

import { InputText } from '@/components/form/InputText';
import { Popover } from '@/components/Popover';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useStorage } from '@/utils/storage/useStorage.util';

export type AttributeFilterType = Record<string, string[]>;

export const getSelectedAttributes = (attributes: AttributeFilterType) => {
  return Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value.length > 0)
  );
};

interface Props {
  value: string[];
  onChange: (assets: string[]) => void;
}

export const AttributeFilter = (props: Props) => {
  const [attributesFilter, setAttributesFilter] = useStorage<string[]>(
    { parentState: props.value, onParentStateChange: props.onChange },
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, boolean>
  >({});

  const filterLabel = useMemo(() => {
    if (attributesFilter.length === 0) {
      return 'All Attributes';
    }
    return (
      attributesFilter.map(att => att.replace('#attribute#', '')).join(', ') ||
      'All Attributes'
    );
  }, [attributesFilter]);

  const { data: searchResults } = useGenericSearch(
    { query: `#attribute#${searchQuery}` },
    { enabled: Boolean(searchQuery) }
  );

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const nestedResults = useMemo(() => {
    if (!searchResults?.attributes) return {};
    return searchResults.attributes.reduce(
      (acc, attr) => {
        if (!acc[attr.name]) {
          acc[attr.name] = {};
        }
        if (!acc[attr.name][attr.value]) {
          acc[attr.name][attr.value] = [];
        }
        acc[attr.name][attr.value].push({
          ...attr,
          asset: attr.source,
        });
        return acc;
      },
      {} as Record<
        string,
        Record<string, Array<{ asset: string; key: string; value: string }>>
      >
    );
  }, [searchResults]);

  const handleSelectAttribute = (key: string) => {
    setSelectedAttributes(prev => {
      const newSelectedAttributes = { ...prev, [key]: !prev[key] };
      updateFilter(newSelectedAttributes);
      return newSelectedAttributes;
    });
  };

  const handleSelectGroup = (attribute: string, value: string) => {
    const groupKey = `${attribute}#${value}`;
    setSelectedAttributes(prev => {
      const newSelectedAttributes = { ...prev, [groupKey]: !prev[groupKey] };
      updateFilter(newSelectedAttributes);
      return newSelectedAttributes;
    });
  };

  const updateFilter = (newSelectedAttributes: Record<string, boolean>) => {
    const updatedAttributes = Object.keys(newSelectedAttributes).filter(
      attrKey => newSelectedAttributes[attrKey]
    );

    setAttributesFilter(updatedAttributes);
  };

  const selectedOptions = useMemo(() => {
    return Object.keys(selectedAttributes).filter(
      attrKey => selectedAttributes[attrKey]
    );
  }, [selectedAttributes]);

  return (
    <Popover
      label={filterLabel}
      styleType="header"
      endIcon={
        <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
      }
    >
      <div className="w-[400px] p-4 md:w-[500px]">
        <p className="mb-2 text-sm text-default-light">
          Chariot collects metadata about assets, known as attributes. These
          key/value pairs describe specific properties you can search below.
        </p>
        <InputText
          name="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search attributes"
          className="mb-4"
        />
        {searchResults?.attributes && searchResults.attributes.length > 0 && (
          <div className="h-64 overflow-auto rounded-sm border border-gray-300">
            <ul className="relative h-full">
              {Object.keys(nestedResults).map(attribute => (
                <li key={attribute}>
                  <div className="text-md bg-gray-100 px-4 py-2 font-medium">
                    {attribute}
                  </div>
                  <ul>
                    {Object.keys(nestedResults[attribute]).map(
                      (value, index) => (
                        <li
                          key={value}
                          className={`cursor-pointer px-4 py-2 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                          onClick={() => handleSelectGroup(attribute, value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {selectedAttributes[`${attribute}#${value}`] ? (
                                <Square className="size-4 rounded-sm bg-brand text-brand" />
                              ) : (
                                <Square className="size-4 rounded-md text-gray-500" />
                              )}
                              <span className="ml-2 text-sm font-medium">
                                {value}
                              </span>
                            </div>
                            <span className="text-gray-500">
                              ({nestedResults[attribute][value].length})
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          {selectedOptions.length > 0 ? (
            <div className="rounded-md bg-gray-100 p-4">
              <p className="mb-3 font-medium text-gray-800">
                Selected Attributes:
              </p>
              <ul className="space-y-2">
                {selectedOptions.map(option => (
                  <li
                    key={option}
                    className="flex items-center justify-between rounded-md bg-white p-2 shadow-sm"
                  >
                    <span className="mr-2">{option}</span>
                    <button
                      onClick={() => handleSelectAttribute(option)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Deselect
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-md bg-gray-100 p-4">
              <p className="mb-3 font-medium text-gray-800">
                Example searches:
              </p>
              <ul className="list-inside list-disc text-gray-700">
                <li className="mb-2">
                  <span className="font-bold">ssh</span>: Find all assets with
                  the attribute name &quot;ssh&quot;.
                </li>
                <li className="mb-2">
                  <span className="font-bold">ssh#22</span>: Find all assets
                  with the attribute name &quot;ssh&quot; and the value
                  &quot;22&quot;.
                </li>
                <li className="mb-2">
                  <span className="font-bold">source#acme.com</span>: Find all
                  assets discovered from the source &quot;acme.com&quot;.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Popover>
  );
};
