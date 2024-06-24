import { useMemo } from 'react';

import { DropdownMenu } from '@/components/Dropdown';
import { MenuItemProps } from '@/components/Menu';
import { ActionsWithRowSelection } from '@/components/table/types';

export function mapActionsWithRowSelection<TData>(
  selectedRows: string[],
  data: TData[],
  rowData: TData,
  isGlobal: boolean,
  props?: ActionsWithRowSelection<TData>
): DropdownMenu | undefined {
  return useMemo((): DropdownMenu | undefined => {
    function updateMenuItemsProps(
      item: ActionsWithRowSelection<TData>['items'][0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rowDatasToSend: any
    ): MenuItemProps {
      const { onClick, label, icon, disabled, hide, submenu, ...restItems } =
        item;

      return {
        ...restItems,
        onClick: () => {
          onClick?.(rowDatasToSend);
        },
        label: typeof label === 'function' ? label(rowData) : label,
        icon: typeof icon === 'function' ? icon(rowData) : icon,
        disabled:
          typeof disabled === 'function' ? disabled(rowDatasToSend) : disabled,
        hide: typeof hide === 'function' ? hide(rowDatasToSend) : hide,
        submenu: submenu?.map(item =>
          updateMenuItemsProps(item, rowDatasToSend)
        ),
      };
    }

    if (props) {
      const rowDatasToSend = isGlobal
        ? selectedRows.map(i => data[Number(i)]).filter(Boolean)
        : [rowData];

      return {
        ...props,
        items: props.items.map(item =>
          updateMenuItemsProps(item, rowDatasToSend)
        ),
      };
    }
  }, [props, selectedRows.length, data.length]);
}
