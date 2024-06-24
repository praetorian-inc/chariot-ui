import { ReactNode } from 'react';
import { To } from 'react-router-dom';

import { DropdownProps } from '@/components/Dropdown';
import { NoDataProps } from '@/components/ui/NoData';

export type CellAlignment = 'center';

export interface TableProps<TData> {
  className?: string;
  tableClassName?: string;
  name: string;
  columns: Columns<TData>;
  data: TData[];
  counters?: JSX.Element;
  filters?: JSX.Element;
  selection?: {
    value?: string[];
    onChange?: (value: string[]) => void;
  };
  rowActions?: ActionsWithRowSelection<TData>;
  status: 'error' | 'success' | 'pending';
  error: Error | null;
  noData?: Partial<NoDataProps>;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  onRowClick?: (item: TData, rowIndex: number) => void;
  actions?: ActionsWithRowSelection<TData>;
  loadingRowCount?: number;
  footer?: boolean;
  header?: boolean;
  groupBy?: {
    label: string;
    filter: (data: TData) => boolean;
  }[];
}

export interface Column<TData> {
  label: string;
  id: keyof TData | '';
  cell?:
    | 'date'
    | 'highlight'
    | ((item: TData, selectedRowsData?: TData[]) => ReactNode);
  to?: (item: TData, selectedRowsData?: TData[]) => To;
  formatText?: (item: TData) => string;
  className?: string;
  fixedWidth?: number;
  align?: CellAlignment;
  onClick?: (item: TData) => void;
  copy?: boolean;
}

export type Columns<TData> = Column<TData>[];

export type InternalTData<TData> = TData & {
  _type?: 'colgroup';
  _label?: string;
  _idx: string;
};

export type ActionsWithRowSelection<TData> = Omit<
  DropdownProps['menu'],
  'items'
> & {
  items: (Omit<
    DropdownProps['menu']['items'][0],
    'onClick' | 'label' | 'icon' | 'disabled' | 'hide' | 'submenu'
  > & {
    onClick?: (selectedRows: TData[]) => void;
    label: string | ((data: TData) => string);
    icon?: ReactNode | ((data: TData) => ReactNode);
    disabled?: boolean | ((data: TData[]) => boolean);
    hide?: boolean | ((data: TData[]) => boolean);
    submenu?: ActionsWithRowSelection<TData>['items'];
  })[];
};
