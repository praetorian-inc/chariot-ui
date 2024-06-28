import { PlusIcon } from '@heroicons/react/20/solid';

import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { useMy } from '@/hooks';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { useGlobalState } from '@/state/global.state';
import { Reference } from '@/types';
import { prettyPrint } from '@/utils/prettyPrint.util';

export function References() {
  const {
    data: references,
    status,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({ resource: 'ref', filterByGlobalSearch: true });
  const { getRiskDrawerLink } = useOpenDrawer();

  const {
    modal: { reference },
  } = useGlobalState();

  const columns: Columns<Reference> = [
    {
      label: 'Risk',
      id: 'name',
      className: 'w-full',
      copy: false,
      to: item => {
        const dns = item.key.split('#')[2];
        const name = item.key.split('#')[3];

        return getRiskDrawerLink({ dns, name });
      },
      cell: item => {
        const ip = item.key.split('#')[3];
        const dns = item.key.split('#')[2];

        return (
          <p className="cursor-pointer truncate font-medium text-brand">
            {ip !== dns ? (
              <span>
                {dns} ({ip})
              </span>
            ) : (
              item.dns
            )}
          </p>
        );
      },
    },
    {
      label: 'Class',
      id: 'class',
      fixedWidth: 120,
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
      fixedWidth: 190,
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
      name={'references'}
      columns={columns}
      data={references}
      primaryAction={() => {
        return {
          label: 'Add Reference',
          onClick: () => {
            reference.onOpenChange(true);
          },
          startIcon: <PlusIcon className="size-5" />,
        };
      }}
      status={status}
      error={error}
    />
  );
}
