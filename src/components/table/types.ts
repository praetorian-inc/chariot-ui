import { ReactNode } from 'react';
import { To } from 'react-router-dom';

import { ButtonProps } from '@/components/Button';
import { DropdownProps } from '@/components/Dropdown';
import { NoDataProps } from '@/components/ui/NoData';

export type CellAlignment = 'center' | 'left' | 'right';

export interface TableProps<TData> {
  className?: string;
  tableClassName?: string;
  name: string;
  columns: Columns<TData>;
  data: TData[];
  filters?: JSX.Element;
  selection?: {
    value?: string[];
    onChange?: (value: string[]) => void;
  };
  status: 'error' | 'success' | 'pending';
  error: Error | null;
  noData?: Partial<NoDataProps>;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  onRowClick?: (item: TData, rowIndex: number) => void;
  primaryAction?: (selectedRowsData: TData[]) => ButtonProps;
  actions?: (selectedRowsData: TData[]) => TableActions;
  rowActions?: (rowData: TData) => TableActions;
  loadingRowCount?: number;
  isTableView?: boolean;
  groupBy?: {
    label: string;
    filter: (data: TData) => boolean;
  }[];
  skipHeader?: boolean;
  resize?: boolean;
}

export interface Column<TData> {
  label: string;
  id: keyof TData | '';
  cell?:
    | 'date'
    | 'highlight'
    | ((item: TData, selectedRowsData?: TData[]) => ReactNode);
  to?: (item: TData, selectedRowsData?: TData[]) => To;
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

export type TableActions = Pick<DropdownProps, 'menu' | 'disabled'>;
