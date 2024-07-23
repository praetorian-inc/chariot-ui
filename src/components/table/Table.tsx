/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Fix the types for the Table component */

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { MoveDown } from 'lucide-react';
import {
  ChevronDownIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { notUndefined, useVirtualizer } from '@tanstack/react-virtual';

import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Input } from '@/components/form/Input';
import { Loader } from '@/components/Loader';
import { CELL_WIDTHS, ROW_HEIGHT } from '@/components/table/constants';
import { TableBody } from '@/components/table/TableBody';
import { TableCheckBoxIcon } from '@/components/table/TableCheckboxIcon';
import {
  CellAlignment,
  InternalTData,
  TableProps,
} from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { Body } from '@/components/ui/Body';
import { NoData } from '@/components/ui/NoData';
import { useScroll } from '@/hooks';
import { useResize } from '@/hooks/useResize';
import {
  RenderHeaderBreadcrumbSection,
  RenderHeaderExtraContentSection,
} from '@/sections/AuthenticatedApp';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';
import { useSearchParams } from 'react-router-dom';
import { set } from 'date-fns';

// eslint-disable-next-line complexity
export function Table<TData>(props: TableProps<TData>) {
  const {
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
    isTableView = true,
    primaryAction,
    skipHeader,
    resize = false,
  } = props;
  const [searchParams, addSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
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
                      _icon: group.icon,
                    },
                    ...(expandedGroups.includes(group.label)
                      ? filteredData
                      : []),
                  ]
                : acc;

            return newData as InternalTData<TData>[];
          }, [] as InternalTData<TData>[])
        : indexedData;

    return groupedData.filter(item => {
      // filter by searchValue
      if (searchValue && searchValue.length > 0) {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      return true;
    });
  }, [
    JSON.stringify(groupBy?.map(group => ({ ...group, icon: undefined }))),
    JSON.stringify(indexedData),
    JSON.stringify(expandedGroups),
    status,
    searchValue,
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
  const reviewStep = searchParams.get('review');

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
    const newSelectedRows = isAllRowSelected
      ? []
      : indexedData.map(({ _idx }) => _idx);
    setSelectedRows(newSelectedRows);
    if (reviewStep === '1') {
      addSearchParams({ review: '2' });
    }
  }

  const isError = status === 'error';
  const isEmpty = status === 'success' && rawData.length === 0;
  const isLoadingOrHaveData = !isError && !isEmpty;
  const columnsLength =
    columns.length + (enableCheckbox ? 1 : 0) + (rowActions ? 1 : 0);

  const { parsedActions, parsedPrimaryAction } = useMemo(() => {
    const selectedRowData = selectedRows
      .map(i => rawData[Number(i)])
      .filter(Boolean);

    return {
      parsedActions: actions?.(selectedRowData),
      parsedPrimaryAction: primaryAction?.(selectedRowData),
    };
  }, [JSON.stringify({ selectedRows, rawData }), actions]);

  return (
    <Body
      ref={parentRef}
      className={className}
      footer={isTableView}
      header={isTableView}
    >
      {(filters || parsedActions || parsedPrimaryAction) && (
        <RenderHeaderExtraContentSection>
          <div className="flex justify-between">
            {filters}

            <div className="flex space-x-4">
              <Input
                name="search"
                placeholder={`Search ${tableName}`}
                className="h-9 w-64 justify-end rounded-sm border-gray-900 bg-header-light p-2 text-sm text-white  ring-0"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                startIcon={
                  <MagnifyingGlassIcon className="size-5 stroke-2 text-default-light" />
                }
              />

              <div className="flex flex-nowrap">
                {parsedPrimaryAction && (
                  <Button
                    {...parsedPrimaryAction}
                    styleType="header"
                    className="rounded-none rounded-l-[2px]"
                  />
                )}

                {parsedActions && (
                  <div className="relative origin-bottom-right">
                    <Tooltip
                      title={
                        selectedRows.length === 0
                          ? `No ${tableName} selected.`
                          : ''
                      }
                    >
                      <Dropdown
                        disabled={selectedRows.length === 0}
                        className={cn(
                          parsedPrimaryAction &&
                            'relative rounded-none rounded-r-[2px] bg-header-dark disabled:bg-header-dark disabled:cursor-not-allowed'
                        )}
                        styleType="header"
                        endIcon={
                          <ChevronDownIcon className="size-3 stroke-[4px]" />
                        }
                        {...parsedActions}
                      ></Dropdown>
                    </Tooltip>
                    {reviewStep === '2' && (
                      <div className="absolute bottom-full right-0 text-left w-80 p-4 pr-3 bg-white rounded-t-md -shadow-lg z-0">
                        <button
                          onClick={() => {
                            searchParams.delete('review');
                            addSearchParams(searchParams);
                          }}
                          className="absolute top-2 right-2"
                        >
                          <XMarkIcon className="w-4 h-4 " />
                        </button>
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="text-sm ">
                              Step 2:{' '}
                              <span className="font-bold">Remediate</span>
                            </p>
                            <p className="mt-1 text-xs font-normal text-gray-600">
                              Click here to remediate all selected items.
                            </p>
                          </div>
                          <MoveDown className="w-6 h-6 ml-2 mt-auto" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </RenderHeaderExtraContentSection>
      )}
      {isTableView && (
        <RenderHeaderBreadcrumbSection>
          <Loader styleType="header" className="h-8 w-28" isLoading={isLoading}>
            {rawData.length > 0 && (
              <span className="ml-auto text-2xl font-bold">{`${rawData.length?.toLocaleString()} Shown`}</span>
            )}
          </Loader>
        </RenderHeaderBreadcrumbSection>
      )}
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
          <thead
            className={cn(
              'sticky bg-layer0',
              isTableView && !skipHeader ? 'top-16' : 'top-0'
            )}
            style={{ zIndex: 1 }}
          >
            <tr className="relative">
              {enableCheckbox && (
                <Th fixedWidth={CELL_WIDTHS.checkbox} align="center">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      className={'hidden'}
                      checked={isAllRowSelected}
                    />
                    <TableCheckBoxIcon isChecked={isAllRowSelected} />
                    {reviewStep === '1' && (
                      <div className=" absolute bottom-full translate-y-3 left-0 text-left w-80 p-4 pt-2 pl-3 bg-white rounded-t-md -shadow-lg z-10">
                        <button
                          onClick={e => {
                            e.preventDefault();
                            searchParams.delete('review');
                            addSearchParams(searchParams);
                          }}
                          className="absolute top-2 right-2"
                        >
                          <XMarkIcon className="w-4 h-4 " />
                        </button>
                        <div className="flex items-start">
                          <MoveDown className="w-6 h-6 mr-2 mt-auto" />
                          <div>
                            <p className="text-sm ">
                              Step 1:{' '}
                              <span className="font-bold">Select All</span>
                            </p>
                            <p className="mt-1 text-xs font-normal text-gray-600">
                              Click here to select all items for remediation.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                    resize={resize}
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
  resize?: boolean;
}) {
  const ref = useRef<HTMLTableCellElement>(null);
  const { fixedWidth, resize = false, ...restProps } = props;
  const { size, onMouseDown } = useResize({
    el: ref.current || document.createElement('div'),
    minWidth: fixedWidth || 100,
  });

  return (
    <th
      {...restProps}
      className={cn(
        'pl-3 py-3 text-bold text-left text-sm font-bold relative text-nowrap',
        props.align === 'center' && 'text-center',
        props.align === 'right' && 'text-right',
        props.className
      )}
      style={
        resize
          ? {
              minWidth: fixedWidth || 100,
              width: size.x || fixedWidth,
            }
          : fixedWidth
            ? { maxWidth: fixedWidth, minWidth: fixedWidth, width: fixedWidth }
            : {}
      }
      ref={ref}
    >
      <div className="th-top-border absolute left-0 top-0 w-full border-b border-solid border-default" />
      <div className="th-bottom-border absolute bottom-0 left-0 w-full border-b border-solid border-default" />

      <div className="flex justify-between">
        {props.children}
        {resize && (
          <span
            className="resize-el text-layer1 hover:cursor-col-resize"
            onMouseDown={onMouseDown}
          >
            |
          </span>
        )}
      </div>
    </th>
  );
}
