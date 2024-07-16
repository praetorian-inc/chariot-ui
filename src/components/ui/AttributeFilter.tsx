import React, { useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

import { Popover } from '@/components/Popover';
import { useAssetsWithAttributes } from '@/hooks/useAttribute';
import { useFilter } from '@/hooks/useFilter';
import { parseKeys, TypeSearch } from '@/sections/SearchByType';

export type AttributeFilterType = Record<string, string[]>;

export const getSelectedAttributes = (attributes: AttributeFilterType) => {
  return Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value.length > 0)
  );
};

interface Props {
  resource?: string;
  onAssetsChange: (assets: string[]) => void;
}

/**
 * This component is used to filter assets by their attributes
 * This is primarily used in the AssetDrawer component
 * If we need it for other resources, we'll have to make modifications to the useAssetsWithAttributes hook
 */
export const AttributeFilter = (props: Props) => {
  const { resource = 'asset' } = props;

  const [attributesFilter, setAttributesFilter] = useFilter<string[]>(
    [],
    `${resource}-attributes`
  );

  const attFilterKeys = useMemo(() => {
    return attributesFilter.map(att => {
      const attribute = parseKeys.attributeKey(att);
      return `${attribute.name}#${attribute.value}`;
    });
  }, [JSON.stringify(attributesFilter)]);

  const { data, status } = useAssetsWithAttributes(attFilterKeys);

  useEffect(() => {
    if (status === 'success' && data) {
      props.onAssetsChange(data);
    }
  }, [status, JSON.stringify(data)]);

  return (
    <Popover
      label="Attribute Filter"
      styleType="header"
      endIcon={
        <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
      }
    >
      <TypeSearch
        queryPrefix="#attribute#"
        onChange={({ attributes }) => {
          setAttributesFilter(attributes || []);
        }}
        types={['attributes']}
        value={{ attributes: attributesFilter }}
        filterOption={attribute => {
          return (attribute as { source: string }).source.startsWith('#asset');
        }}
      />
    </Popover>
  );
};
