import { ReactNode } from 'react';
import {
  ChevronDownIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { VirtualItem } from '@tanstack/react-virtual';

import { Loader } from '@/components/Loader';
import { ROW_HEIGHT } from '@/components/table/constants';
import { TableCellContent } from '@/components/table/TableCellContent';
import { TableCheckBoxIcon } from '@/components/table/TableCheckboxIcon';
import { TableRowActions } from '@/components/table/TableRowActions';
import {
  ActionsWithRowSelection,
  CellAlignment,
  Columns,
  InternalTData,
  TableProps,
} from '@/components/table/types';
import { cn } from '@/utils/classname';

interface TableBodyProps<TData> {
  selectedRows: string[];
  data: InternalTData<TData>[];
  rowActions?: ActionsWithRowSelection<TData>;
  rowData: InternalTData<TData>;
  rowIndex: number;
  virtualRow: VirtualItem;
  isChecked: boolean;
  handleRowClick: (
    idx: number,
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  enableCheckbox: boolean;
  isLoading: boolean;
  columns: Columns<TData>;
  isClickable: boolean;
  expandedGroups: string[];
  toggleExpandedGroup: (group?: string) => void;
  groupBy?: TableProps<TData>['groupBy'];
}

const getGroupIcon = (label: string) => {
  if (label === 'High Priority') return <BoltIcon className="size-4" />;
  if (label === 'Standard Priority') return <ClockIcon className="size-4" />;
  return null;
};
export function TableBody<TData>(props: TableBodyProps<TData>) {
  const {
    selectedRows,
    data,
    rowActions,
    rowData,
    rowIndex,
    virtualRow,
    isChecked,
    handleRowClick,
    enableCheckbox,
    isLoading,
    columns,
    isClickable,
    expandedGroups,
    toggleExpandedGroup,
  } = props;

  const isFirstRow = rowIndex === 0;

  if (rowData?._type === 'colgroup') {
    const GroupName = rowData?._label || 'Group';

    const isExpanded = expandedGroups.includes(GroupName);
    return (
      <tr
        className="cursor-pointer border-t border-gray-200 bg-layer1 text-sm font-semibold"
        key={`row-${rowIndex}`}
        style={{
          height: `${virtualRow.size}px`,
        }}
        onClick={() => toggleExpandedGroup(GroupName)}
      >
        <th className="">
          <ChevronDownIcon
            className={cn('size-4 m-auto', !isExpanded && 'rotate-180')}
          />
        </th>
        <th className="text-left" colSpan={columns.length + 2} scope="colgroup">
          <Loader isLoading={isLoading}>
            <div className="flex flex-row space-x-2 items-center">
              {getGroupIcon(GroupName)}
              <p>{GroupName}</p>
            </div>
          </Loader>
        </th>
      </tr>
    );
  }

  return (
    <tr
      key={`row-${rowIndex}`}
      style={{
        height: `${virtualRow.size}px`,
      }}
      className={cn(
        isChecked && 'bg-highlight/10',
        isClickable && `cursor-pointer`
      )}
      onClick={event => {
        event.preventDefault();
        handleRowClick(Number(rowData._idx), event);
      }}
    >
      {enableCheckbox && (
        <Td align="center" isFirstRow={isFirstRow} isLoading={isLoading}>
          <Loader isLoading={isLoading}>
            <label data-checkbox className="cursor-pointer" tabIndex={0}>
              <input
                type="checkbox"
                checked={isChecked}
                className="hidden"
                onChange={() => {}}
              />
              <TableCheckBoxIcon isChecked={isChecked} />
            </label>
          </Loader>
        </Td>
      )}
      {columns.map((col, colIndex) => (
        <Td
          key={`row-${rowIndex}-${colIndex}${String(col.id)}`}
          className={col.className}
          isFirstRow={isFirstRow}
          isLoading={isLoading}
          align={col.align}
        >
          <Loader isLoading={isLoading}>
            <TableCellContent
              col={col}
              item={rowData}
              selectedRowsData={selectedRows.map(i => data[Number(i)])}
              onClick={col.onClick ? () => col?.onClick?.(rowData) : undefined}
            />
          </Loader>
        </Td>
      ))}
      {rowActions && (
        <Td align="center" isFirstRow={isFirstRow} isLoading={isLoading}>
          <Loader isLoading={isLoading}>
            <TableRowActions
              selectedRows={selectedRows}
              data={data}
              rowData={rowData}
              rowActions={rowActions}
            />
          </Loader>
        </Td>
      )}
    </tr>
  );
}

export function Td(props: {
  className?: string;
  align?: CellAlignment;
  colSpan?: number;
  children: ReactNode;
  isFirstRow: boolean;
  isLoading: boolean;
}) {
  return (
    <td
      colSpan={props.colSpan}
      className={cn(
        'px-3 text-default max-w-full truncate text-sm relative',
        props.align === 'center' && '[&>*]:m-auto text-center',
        props.className
      )}
      style={{
        height: ROW_HEIGHT,
      }}
    >
      <div
        className={cn([
          !props.isFirstRow &&
            'border-t border-default top-0 left-0 absolute w-full ',
          'flex items-center',
        ])}
      />
      {props.children}
    </td>
  );
}
