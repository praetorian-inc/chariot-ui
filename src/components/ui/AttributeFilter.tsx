import React, { useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { Dropdown } from '@/components/Dropdown';
import { MenuProps } from '@/components/Menu';
import { useAssetsWithAttributes } from '@/hooks/useAttribute';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';

export type AttributeFilterType = Record<string, string[]>;

export const getSelectedAttributes = (attribues: AttributeFilterType) => {
  return Object.fromEntries(
    Object.entries(attribues).filter(([, value]) => value.length > 0)
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
  const { data: stats = {}, status: statusCounts } = useCounts({
    resource: 'attribute',
  });

  const menuItems =
    statusCounts === 'pending' ? [] : getMenuItems(resource, stats);

  const { data, status } = useAssetsWithAttributes(attributesFilter);

  useEffect(() => {
    if (status === 'success' && data) {
      props.onAssetsChange(data);
    }
  }, [status, data]);

  return (
    <Dropdown
      styleType="header"
      label={
        attributesFilter.length > 0 && attributesFilter[0] !== ''
          ? attributesFilter
              .map(attributes => attributes.split('#')[1])
              .join(', ')
          : 'All Attributes'
      }
      endIcon={
        <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
      }
      menu={{
        className: 'h-[400px]',
        items: menuItems,
        onSelect: attributesFilter => {
          setAttributesFilter(attributesFilter);
        },
        value: attributesFilter,
        multiSelect: true,
      }}
    />
  );
};

const getMenuItems = (
  resource: string,
  stats: Record<string, number>
): MenuProps['items'] => {
  const statsObject = Object.entries(stats)
    .filter(([key]) => key.endsWith(`#${resource}`))
    .reduce(
      (acc, [label, count]) => {
        const [, name, value] = label.split('#');
        return {
          ...acc,
          [name]: {
            ...acc[name],
            [value]: count,
          },
        };
      },
      {} as Record<string, Record<string, number>>
    );
  const menuItems = Object.entries(statsObject).reduce<MenuProps['items']>(
    (acc, [name, values]) => {
      // Skip source attribute, as it has a separate filter
      if (name === 'source') {
        return acc;
      }

      return [
        ...acc,
        {
          label: name,
          type: 'label' as const,
        },
        ...Object.entries(values).map(([value, count]) => ({
          label: value,
          labelSuffix: count.toLocaleString(),
          value: `${name}#${value}`,
        })),
      ];
    },
    []
  );
  return menuItems;
};
