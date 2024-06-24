import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Dropdown, DropdownProps } from '@/components/Dropdown';

interface TableActionProps {
  actions?: DropdownProps['menu'];
}

export function TableAction(props: TableActionProps) {
  const { actions } = props;

  if (!actions) {
    return null;
  }

  const buttonElement = document.getElementById('table-buttons');
  if (!buttonElement) {
    return null;
  }

  if (actions.items.length === 1) {
    return createPortal(
      <>
        <Button
          styleType="header"
          onClick={() => {
            actions.items[0].onClick?.();
          }}
        >
          {actions.items[0].label}
        </Button>
      </>,
      buttonElement
    );
  }

  return createPortal(
    <>
      <Dropdown
        styleType="header"
        label="Actions"
        endIcon={
          <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
        }
        menu={actions}
      />
    </>,
    buttonElement
  );
}
