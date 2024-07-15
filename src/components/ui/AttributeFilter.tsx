import React, { useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { Dropdown } from '@/components/Dropdown';
import { MenuProps } from '@/components/Menu';
import { useCommonAssetsWithAttributes } from '@/hooks/useAttribute';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';

export type AttributeFilterType = Record<string, string[]>;

export const getSelectedAttributes = (attribues: AttributeFilterType) => {
  return Object.fromEntries(
    Object.entries(attribues).filter(([, value]) => value.length > 0)
  );
};

interface Props {
  onAssetsChange: (assets: string[]) => void;
}

export const AttributeFilter = (props: Props) => {
  const [attributesFilter, setAttributesFilter] = useFilter<string[]>(
    [],
    'asset-attributes'
  );
  const { data: stats = {}, status: statusCounts } = useCounts({
    resource: 'attribute',
  });

  const menuItems = statusCounts === 'pending' ? [] : getMenuItems(stats);

  const { data, status } = useCommonAssetsWithAttributes(attributesFilter);

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
          : 'Attribute'
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

const getMenuItems = (stats: Record<string, number>): MenuProps['items'] => {
  const statsObject = Object.entries(stats).reduce(
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
