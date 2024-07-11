import { PlusIcon } from '@heroicons/react/24/outline';

import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { useMy } from '@/hooks';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { useGlobalState } from '@/state/global.state';
import { Attribute } from '@/types';
import { capitalize } from '@/utils/lodash.util';

export function Attributes() {
  const {
    data: attributes,
    status,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({ resource: 'attribute', filterByGlobalSearch: true });

  const {
    modal: { attribute },
  } = useGlobalState();

  const columns: Columns<Attribute> = [
    {
      label: 'Name',
      id: 'name',
      className: 'w-full',
      copy: true,
      cell: item => getAttributeDetails(item).parsedName,
      to: item => getAttributeDetails(item).url,
    },
    {
      label: 'Type',
      id: '',
      fixedWidth: 80,
      cell: item => capitalize(getAttributeDetails(item).attributeType),
    },
    {
      label: 'Class',
      id: 'class',
      fixedWidth: 220,
      copy: true,
    },
    {
      label: 'Value',
      id: 'name',
      className: 'w-[190px]',
      copy: true,
      cell: item => {
        // if item is a date
        if (item.class === 'expiration') {
          return (
            <Tooltip title={item.name}>
              {new Date(item.name).toLocaleDateString()}
            </Tooltip>
          );
        } else {
          return item.name;
        }
      },
    },
    {
      label: 'Last Seen',
      id: 'updated',
      cell: 'date',
    },
  ];

  return (
    <Table
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      name={'attributes'}
      columns={columns}
      data={attributes}
      primaryAction={() => {
        return {
          label: 'Add Attribute',
          onClick: () => {
            attribute.onOpenChange(true);
          },
          startIcon: <PlusIcon className="size-5" />,
        };
      }}
      status={status}
      error={error}
      skipHeader
    />
  );
}

export function getAttributeDetails(attribute: Attribute) {
  const [, , attributeType, dns, name] = attribute.key.split('#');

  const url =
    attributeType === 'asset'
      ? getDrawerLink().getAssetDrawerLink({ dns, name })
      : getDrawerLink().getRiskDrawerLink({ dns, name });

  return {
    attributeType,
    dns,
    name,
    parsedName: `${dns} (${name})`,
    class: attribute.class,
    url: url,
  };
}
