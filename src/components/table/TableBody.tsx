import { ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { VirtualItem } from '@tanstack/react-virtual';

import { Dropdown } from '@/components/Dropdown';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { Loader } from '@/components/Loader';
import { ROW_HEIGHT } from '@/components/table/constants';
import { TableCellContent } from '@/components/table/TableCellContent';
import { TableCheckBoxIcon } from '@/components/table/TableCheckboxIcon';
import {
  CellAlignment,
  Columns,
  InternalTData,
  TableProps,
} from '@/components/table/types';
import { AssetStatus } from '@/types';
import { cn } from '@/utils/classname';

interface TableBodyProps<TData> {
  selectedRows: string[];
  data: InternalTData<TData>[];
  rowActions?: TableProps<TData>['rowActions'];
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
  if (label === 'High Priority')
    return getAssetStatusIcon(AssetStatus.ActiveHigh);
  if (label === 'Standard Priority')
    return getAssetStatusIcon(AssetStatus.Active);
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
        className="cursor-pointer border-t border-default bg-layer2 text-sm font-semibold"
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
            <div className="flex flex-row items-center space-x-2">
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
            <Dropdown
              onClick={event => {
                event.stopPropagation();
              }}
              startIcon={
                <EllipsisVerticalIcon className="m-auto size-6 text-default-light" />
              }
              styleType="none"
              {...rowActions(rowData)}
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
        props.align === 'right' && 'text-right',
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
