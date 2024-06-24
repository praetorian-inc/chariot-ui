/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Fix the types for the Table component */

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { notUndefined, useVirtualizer } from '@tanstack/react-virtual';

import { DropdownProps } from '@/components/Dropdown';
import { CELL_WIDTHS, ROW_HEIGHT } from '@/components/table/constants';
import { TableAction } from '@/components/table/TableAction';
import { TableBody } from '@/components/table/TableBody';
import { TableCheckBoxIcon } from '@/components/table/TableCheckboxIcon';
import { TableFilters } from '@/components/table/TableFilters';
import {
  CellAlignment,
  InternalTData,
  TableProps,
} from '@/components/table/types';
import { mapActionsWithRowSelection } from '@/components/table/util';
import { Body } from '@/components/ui/Body';
import { NoData } from '@/components/ui/NoData';
import { useScroll } from '@/hooks';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

export function Table<TData>(props: TableProps<TData>) {
  const {
    counters,
    className,
    filters,
    tableClassName,
    columns,
    data: rawData,
    selection,
    noData,
    status,
    error,
    name: tableName,
    fetchNextPage,
    isFetchingNextPage,
    rowActions,
    actions,
    groupBy,
    onRowClick,
    loadingRowCount = 25,
    footer = true,
    header = true,
  } = props;

  const [expandedGroups, setExpandedGroups] = useState(
    groupBy?.map(group => group.label) || []
  );

  const indexedData: InternalTData<TData>[] = useMemo(() => {
    return rawData.map((item, _index) => ({
      ...item,
      _idx: _index.toString(),
    }));
  }, [JSON.stringify(rawData)]);

  // Filter the data based on the groupBy value
  const groupedData = useMemo(() => {
    const groupedData =
      groupBy && status === 'success'
        ? groupBy.reduce((acc, group) => {
            const filteredData = indexedData.filter(item => group.filter(item));
            // Add the group label only when there is filtered data available
            const newData =
              filteredData.length > 0
                ? [
                    ...acc,
                    {
                      _label: group.label,
                      _type: 'colgroup',
                      _idx: -1,
                    },
                    ...(expandedGroups.includes(group.label)
                      ? filteredData
                      : []),
                  ]
                : acc;

            return newData as InternalTData<TData>[];
          }, [] as InternalTData<TData>[])
        : indexedData;

    return groupedData;
  }, [
    JSON.stringify(groupBy),
    JSON.stringify(indexedData),
    JSON.stringify(expandedGroups),
    status,
  ]);

  const parentRef = useRef<HTMLDivElement>(null);
  useScroll(parentRef, fetchNextPage);

  const [isBulkSelectionEnabled, setIsBulkSelectionEnabled] = useState(false);
  const [selectedRows, setSelectedRows] = useStorage<string[]>(
    {
      parentState: selection?.value,
      onParentStateChange: selection?.onChange,
    },
    []
  );
  const [lastSelectedRow, setLastSelectedRow] = useState<number>();

  const enableCheckbox = Boolean(selection);
  const isLoading = status === 'pending';
  const virtualizer = useVirtualizer({
    count: isLoading ? loadingRowCount : groupedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  function toggleExpandedGroup(group?: string) {
    if (group) {
      setExpandedGroups(expandedGroups => {
        if (expandedGroups.includes(group)) {
          return expandedGroups.filter(g => g !== group);
        }

        return [...expandedGroups, group];
      });
    }
  }

  const items = virtualizer.getVirtualItems();
  const [before, after] =
    items.length > 0
      ? [
          notUndefined(items[0]).start - virtualizer.options.scrollMargin,
          virtualizer.getTotalSize() -
            notUndefined(items[items.length - 1]).end,
        ]
      : [0, 0];

  const isAllRowSelected = useMemo(() => {
    if (status === 'success') {
      return rawData.length > 0
        ? selectedRows.length === rawData.length
        : false;
    }

    return false;
  }, [rawData.length, selectedRows.length, status]);

  const actionsProps = mapActionsWithRowSelection(
    selectedRows,
    rawData,
    rawData[0],
    true,
    actions
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setIsBulkSelectionEnabled(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setIsBulkSelectionEnabled(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function handleRowClick(
    idx: number,
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) {
    const target = event.target as HTMLElement;
    const clickedCheckbox = target?.closest?.('[data-checkbox]');

    if (enableCheckbox && clickedCheckbox) {
      if (isBulkSelectionEnabled) {
        setSelectedRows(selectedRows => {
          const isChecked = selectedRows.includes(idx.toString());

          if (lastSelectedRow === undefined) {
            return Array(idx + 1)
              .fill(0)
              .map((_, i) => i.toString());
          }
          if (selectedRows.includes(lastSelectedRow.toString())) {
            if (isChecked) {
              // remove selection

              const startIdx = idx < lastSelectedRow ? idx : lastSelectedRow;
              const endIdx = idx < lastSelectedRow ? lastSelectedRow : idx;

              return selectedRows.filter(i => {
                return !(Number(i) <= endIdx && Number(i) >= startIdx);
              });
            } else {
              // add selection

              const startIdx =
                idx < lastSelectedRow ? idx : lastSelectedRow + 1;
              const length = Math.abs(lastSelectedRow - idx);

              return [
                ...new Set([
                  ...selectedRows,
                  ...Array.from({ length }, (_, i) =>
                    (i + startIdx).toString()
                  ),
                ]),
              ];
            }
            //
          } else {
            if (isChecked) {
              // remove selection

              const startIdx = idx < lastSelectedRow ? idx : lastSelectedRow;
              const endIdx = idx < lastSelectedRow ? lastSelectedRow : idx;

              return selectedRows.filter(i => {
                return !(Number(i) <= endIdx && Number(i) >= startIdx);
              });
            } else {
              // add selection

              const startIdx = idx < lastSelectedRow ? idx : lastSelectedRow;
              const length = Math.abs(lastSelectedRow - idx) + 1;

              return [
                ...new Set([
                  ...selectedRows,
                  ...Array.from({ length }, (_, i) =>
                    (i + startIdx).toString()
                  ),
                ]),
              ];
            }
          }
        });
      } else {
        setSelectedRows(selectedRows => {
          const isChecked = selectedRows.includes(idx.toString());

          if (isChecked) {
            return selectedRows.filter(i => i !== idx.toString());
          } else {
            return [...selectedRows, idx.toString()];
          }
        });
      }

      setLastSelectedRow(idx);
    } else {
      onRowClick?.(rawData[idx], idx);
    }
  }

  function handleSelectAll() {
    if (isAllRowSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(indexedData.map(({ _idx }) => _idx));
    }
  }

  const isError = status === 'error';
  const isEmpty = status === 'success' && rawData.length === 0;
  const isLoadingOrHaveData = !isError && !isEmpty;
  const columnsLength =
    columns.length + (enableCheckbox ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <Body ref={parentRef} className={className} footer={footer} header={header}>
      {counters && counters}
      <TableFilters filters={filters} />
      <TableAction actions={actionsProps as DropdownProps['menu']} />
      {isError && (
        <NoData
          title={`Unable to retrieve your ${tableName}`}
          description={
            error && error.message ? error.message : 'Something went wrong!'
          }
          icon={<ExclamationCircleIcon className={`size-20 text-red-400`} />}
        />
      )}
      {isEmpty && (
        <NoData
          title={noData?.title || `No ${tableName} found`}
          description={noData?.description}
          icon={noData?.icon}
        />
      )}
      {isLoadingOrHaveData && (
        <table
          className={cn(
            'w-full relative border-default border border-t-0 bg-layer0 table-fixed',
            isBulkSelectionEnabled && 'select-none',
            tableClassName
          )}
        >
          <thead className="sticky top-0 bg-layer0" style={{ zIndex: 1 }}>
            <tr>
              {enableCheckbox && (
                <Th fixedWidth={CELL_WIDTHS.checkbox} align="center">
                  <label className="cursor-pointer" tabIndex={0}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      className={'hidden'}
                      checked={isAllRowSelected}
                    />
                    <TableCheckBoxIcon isChecked={isAllRowSelected} />
                  </label>
                </Th>
              )}
              {columns.map((column, colIdx) => {
                return (
                  <Th
                    key={`${String(column.id)}-${colIdx}`}
                    className={column.className}
                    fixedWidth={
                      column.cell === 'date'
                        ? column.fixedWidth || CELL_WIDTHS.date
                        : column.fixedWidth
                    }
                    align={column.align}
                  >
                    {column.label}
                  </Th>
                );
              })}
              {rowActions && <Th fixedWidth={CELL_WIDTHS.actions}>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {before > 0 && (
              <tr>
                <td colSpan={columnsLength} style={{ height: before }} />
              </tr>
            )}
            {items.map((virtualRow, rowIndex) => {
              const item = groupedData[virtualRow.index];

              const isChecked =
                item && item?._idx ? selectedRows.includes(item._idx) : false;

              return (
                <TableBody
                  isClickable={Boolean(onRowClick)}
                  key={virtualRow.index}
                  columns={columns}
                  isChecked={isChecked}
                  selectedRows={selectedRows}
                  data={groupedData}
                  rowActions={rowActions}
                  rowData={item}
                  rowIndex={rowIndex}
                  virtualRow={virtualRow}
                  handleRowClick={handleRowClick}
                  enableCheckbox={enableCheckbox}
                  isLoading={isLoading}
                  expandedGroups={expandedGroups}
                  toggleExpandedGroup={toggleExpandedGroup}
                  groupBy={groupBy}
                />
              );
            })}
            {after > 0 && (
              <tr>
                <td colSpan={columnsLength} style={{ height: after }} />
              </tr>
            )}
          </tbody>
        </table>
      )}
      {isFetchingNextPage && (
        <div className="flex w-full items-center justify-center bg-default-dark py-1.5 italic">
          Loading more data...
        </div>
      )}
    </Body>
  );
}

export function Th(props: {
  className?: string;
  fixedWidth?: number;
  children: ReactNode;
  align?: CellAlignment;
}) {
  const { fixedWidth, ...restProps } = props;

  return (
    <th
      {...restProps}
      className={cn(
        'p-3 text-bold text-left text-sm font-bold relative text-nowrap',
        props.align === 'center' && 'text-center',
        props.className
      )}
      style={{
        ...(fixedWidth
          ? { maxWidth: fixedWidth, minWidth: fixedWidth, width: fixedWidth }
          : {}),
      }}
    >
      <div className="th-top-border absolute left-0 top-0 w-full border-b border-solid border-default" />
      <div className="th-bottom-border absolute bottom-0 left-0 w-full border-b border-solid border-default" />
      {props.children}
    </th>
  );
}
