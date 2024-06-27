import { ConditionalRender } from '@/components/ConditionalRender';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Link } from '@/components/Link';
import { OverflowText } from '@/components/OverflowText';
import { Column } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/date.util';

export function TableCellContent<TData>(props: {
  col: Column<TData>;
  item: TData;
  onClick?: () => void;
  selectedRowsData: TData[];
}) {
  const { col, item, selectedRowsData } = props;

  function getCell() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemContent: any = (item as unknown as Record<any, any>)[col.id];
    const content = col.formatText
      ? col.formatText(item)
      : typeof itemContent === 'string'
        ? itemContent
        : `${itemContent}`;

    if (typeof col.cell === 'function') {
      return col.cell(item, selectedRowsData);
    }

    if (col.cell === 'highlight') {
      return (
        <div className="w-full font-medium text-brand">
          <OverflowText text={content || '-'} />
        </div>
      );
    }

    if (col.cell === 'date' && content) {
      return (
        <Tooltip title={content} placement="bottom-end">
          {formatDate(content)}
        </Tooltip>
      );
    }

    return <OverflowText text={content || '-'} />;
  }

  return (
    <div
      className={cn(
        'w-full',
        col.align === 'center' && 'flex justify-center',
        col.onClick && 'cursor-pointer relative'
      )}
      onClick={props.onClick}
    >
      <ConditionalRender
        condition={Boolean(col.copy)}
        conditionalWrapper={children => {
          return <CopyToClipboard>{children}</CopyToClipboard>;
        }}
      >
        <ConditionalRender
          condition={Boolean(col.to)}
          conditionalWrapper={children => {
            return (
              <Link
                to={col.to?.(item) || ''}
                onClick={event => {
                  event.stopPropagation();
                }}
                className="flex overflow-hidden"
                buttonClass="flex overflow-hidden p-0"
              >
                {children}
              </Link>
            );
          }}
        >
          {getCell()}
        </ConditionalRender>
      </ConditionalRender>
    </div>
  );
}
