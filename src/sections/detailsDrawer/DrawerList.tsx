import { ReactNode, useRef } from 'react';
import { To } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ConditionalRender } from '@/components/ConditionalRender';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Link } from '@/components/Link';
import { Tooltip } from '@/components/Tooltip';
import { NoData } from '@/components/ui/NoData';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { formatDate } from '@/utils/date.util';

interface Props {
  items: {
    label: string;
    value: string | ReactNode;
    updated?: string;
    to?: To;
    prefix?: JSX.Element | string;
  }[];
  allowEmpty?: boolean;
  noDataMessage?: JSX.Element;
  dns: string;
}

export const DrawerList = (props: Props) => {
  const { getAssetDrawerLink } = getDrawerLink();
  const { items, allowEmpty } = props;
  const parentRef = useRef<HTMLDivElement>(null);

  if (items.length === 0 && !allowEmpty) {
    return props.noDataMessage ? (
      props.noDataMessage
    ) : (
      <NoData title={'No data found'} />
    );
  }

  if (items.length === 0 && allowEmpty) {
    return null;
  }

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 61,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const createLabel = (label: string, value: ReactNode) => {
    if (label?.toLowerCase() === 'asset') {
      return (
        <a href={value as string} target="_blank" rel="noreferrer">
          {value}
        </a>
      );
    } else {
      return value;
    }
  };

  return (
    <div className="size-full overflow-auto" ref={parentRef}>
      <ul
        className="relative h-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualItems.map(virtualItem => {
          const {
            prefix,
            label,
            updated,
            value,
            to: itemTo,
          } = items[virtualItem.index];

          const assetKey =
            typeof value === 'string' && value.match(/#asset#(.*)#(.*)/);
          const [, dns, name] = assetKey || [];

          const to = itemTo || (assetKey && getAssetDrawerLink({ dns, name }));

          return (
            <li
              key={virtualItem.key}
              className="absolute left-0 top-0 w-full border-b border-default px-6 py-2  odd:bg-gray-50"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CopyToClipboard>
                <ConditionalRender
                  condition={Boolean(to)}
                  conditionalWrapper={children => {
                    return (
                      <Link
                        to={to || ''}
                        onClick={event => {
                          event.stopPropagation();
                        }}
                        className="flex overflow-hidden"
                        buttonClass="flex overflow-hidden p-0 text-default"
                      >
                        {prefix && prefix} {children}
                      </Link>
                    );
                  }}
                >
                  <Tooltip title={value}>
                    <div className="w-full truncate text-lg font-medium">
                      {createLabel(label, value)}
                    </div>
                  </Tooltip>
                </ConditionalRender>
              </CopyToClipboard>
              <div className="flex justify-between text-xs text-default-light">
                <div className="flex flex-row items-center">
                  <CopyToClipboard textToCopy={label}>
                    {label} {updated && ' updated ' + formatDate(updated)}
                  </CopyToClipboard>{' '}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
