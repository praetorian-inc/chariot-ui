import { PlusIcon } from '@heroicons/react/24/outline';

import { Link } from '@/components/Link';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { useMy } from '@/hooks';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { useGlobalState } from '@/state/global.state';
import { Attribute } from '@/types';
import { prettyPrint } from '@/utils/prettyPrint.util';

export function Attributes() {
  const {
    data: attributes,
    status,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({ resource: 'attribute', filterByGlobalSearch: true });
  const { getAssetDrawerLink } = useOpenDrawer();

  const {
    modal: { attribute },
  } = useGlobalState();

  const columns: Columns<Attribute> = [
    {
      label: 'Asset',
      id: 'name',
      className: 'w-full',
      copy: false,
      cell: item => {
        const ip = item.key.split('#')[3];
        return (
          <Link
            to={getAssetDrawerLink({ dns: item.dns, name: ip })}
            className="cursor-pointer truncate font-medium"
          >
            {ip !== item.dns ? (
              <span>
                {item.dns} ({ip})
              </span>
            ) : (
              item.dns
            )}
          </Link>
        );
      },
    },
    {
      label: 'Class',
      id: 'class',
      className: 'w-[120px]',
      copy: true,
      cell: item => {
        if (Number.isNaN(Number.parseInt(item.class))) {
          return prettyPrint(item.class);
        } else {
          return item.class;
        }
      },
    },
    {
      label: 'Name',
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
          icon: <PlusIcon className="size-5" />,
        };
      }}
      status={status}
      error={error}
    />
  );
}
