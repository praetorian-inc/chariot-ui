import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { Link, To } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ChevronRightIcon, StopIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  StopIcon as StopIconSolid,
} from '@heroicons/react/24/solid';

import { Button, ButtonProps } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { OverflowText } from '@/components/OverflowText';
import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

export type MenuProps = {
  items: Omit<MenuItemProps, 'isFocused'>[];
  onClick?: (value?: string) => void;
  value?: string | string[];
  className?: string;
  multiSelect?: boolean;
  onSelect?: (value: string[]) => void;
  emptyState?: {
    label: ReactNode;
    hide?: boolean;
  };
};

interface subMenuOpenProps {
  isSubMenuOpen: boolean;
  setIsSubMenuOpen: (isSubMenuOpen: boolean) => void;
}

export const Menu: React.FC<MenuProps> = props => {
  const {
    className,
    items: unparsedItems,
    onClick,
    multiSelect,
    emptyState,
  } = props;

  const ulRef = useRef<HTMLUListElement>(null);

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [selected, setSelected] = useStorage<string[]>(
    {
      parentState:
        typeof props.value === 'string' ? [props.value] : props.value,
      onParentStateChange: props.onSelect,
    },
    []
  );

  const items = useMemo(() => {
    return unparsedItems.filter(item => !item.hide);
  }, [unparsedItems]);

  return (
    <ul
      ref={ulRef}
      className={cn(
        'relative w-full overflow-auto rounded-[2px] bg-layer0 shadow-lg outline-none ring-1 ring-default-dark',
        className
      )}
    >
      {items.length === 0 && !emptyState?.hide && (
        <li
          className={cn(
            'flex items-center text-xs font-medium text-default-light',
            menuMarginClassName,
            className
          )}
        >
          {emptyState?.label || 'No items found'}
        </li>
      )}
      {items.map((item, index) => (
        <MenuItem
          key={index}
          {...item}
          multiSelect={multiSelect}
          isSubMenuOpen={isSubMenuOpen}
          setIsSubMenuOpen={setIsSubMenuOpen}
          isSelected={
            item.value === undefined ? false : selected.includes(item.value)
          }
          onClick={(...args) => {
            onClick?.(...args);
            item.onClick?.(...args);

            setSelected(prev => {
              let newSelected = prev;
              if (multiSelect && item.value !== undefined) {
                if (item.value) {
                  // Toggle the value
                  if (prev.includes(item.value)) {
                    newSelected = prev.filter(v => v !== item.value);
                  } else {
                    newSelected = [...prev, item.value];
                  }
                  // Toggle "All option" and other values
                  newSelected =
                    newSelected.length > 0
                      ? newSelected.filter(v => v !== '')
                      : [''];
                } else {
                  // If 'All' option is selected, remove all other values
                  newSelected = [''];
                }
              }
              return newSelected;
            });
          }}
        />
      ))}
    </ul>
  );
};

const menuMarginClassName = `m-[8px] w-[calc(100%-16px)]`;

export interface MenuItemProps {
  label: ReactNode;
  labelSuffix?: string | number | JSX.Element;
  value?: string;
  icon?: React.ReactNode;
  description?: string;
  type?: 'label' | 'divider';
  to?: To;
  download?: boolean;
  newTab?: boolean;
  disabled?: boolean;
  hide?: boolean;
  helpText?: string | React.ReactNode;
  onClick?: (value?: string) => void;
  isFocused?: boolean;
  isSelected?: boolean;
  styleType?: ButtonProps['styleType'];
  className?: string;
  tootlip?: string;
  isLoading?: boolean;
  // checked?: boolean;
  submenu?: MenuItemProps[];
}

const MenuItem: React.FC<
  MenuItemProps & subMenuOpenProps & { multiSelect?: boolean }
> = props => {
  if (props.hide) {
    return null;
  }

  if (props.type === 'label') {
    const { label, className } = props;

    return (
      <li
        className={cn(
          'pt-5 pb-2 px-3 text-xs font-medium text-default-light top-0 sticky bg-layer0 z-10 mx-2',
          className
        )}
      >
        {label}
      </li>
    );
  }

  if (props.type === 'divider') {
    return (
      <li
        className={cn('m-2 -ml-2 border-t border-default', props.className)}
      />
    );
  }

  const { to, newTab, download, disabled, onClick, value } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleClick = (event: any) => {
    event?.stopPropagation?.();

    if (!disabled) {
      onClick?.(value);
    }
  };

  if (to) {
    const isNewTab =
      newTab || download || (typeof to === 'string' && to.startsWith('http'));

    return (
      <Link
        onClick={handleClick}
        to={to}
        tabIndex={-1}
        {...(isNewTab
          ? {
              target: '_blank',
              rel: 'noreferrer',
            }
          : {})}
        {...(download
          ? {
              download: true,
            }
          : {})}
      >
        <MenuButton {...props} onClick={undefined}>
          <Content {...props} />
        </MenuButton>
      </Link>
    );
  }

  return (
    <MenuButton {...props} onClick={handleClick}>
      <Content {...props} />
    </MenuButton>
  );
};

function MenuButton(
  props: MenuItemProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children: ReactNode;
  } & subMenuOpenProps
) {
  const {
    disabled,
    onClick,
    isFocused,
    children,
    styleType = 'text',
    className,
    isSelected,
    tootlip,
    isLoading,
    submenu,
    isSubMenuOpen,
    setIsSubMenuOpen,
  } = props;

  const buttonClassName = cn(
    'relative text-start rounded-[2px] flex items-center justify-start m-0 py-2',
    isFocused ? 'outline-none z-10' : '',
    isSelected ? 'bg-brand-lighter' : '',
    menuMarginClassName,
    className
  );

  if (submenu && submenu.length > 0) {
    return (
      <Tooltip title={tootlip} placement="right">
        <Dropdown
          styleType={styleType}
          endIcon={<ChevronRightIcon className="size-4 " />}
          className={cn(buttonClassName)}
          tabIndex={-1}
          isLoading={isLoading}
          disabled={disabled}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
          }}
          menu={{
            placement: 'right-start',
            className: 'm-0.5 -mt-2',
            items: submenu,
            open: isSubMenuOpen,
            onOpenChange: setIsSubMenuOpen,
          }}
        >
          {children}
        </Dropdown>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tootlip} placement="right">
      <Button
        tabIndex={-1}
        isLoading={isLoading}
        disabled={disabled}
        className={cn(buttonClassName)}
        onClick={onClick}
        styleType={styleType}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function Content(props: MenuItemProps & { multiSelect?: boolean }) {
  const {
    label,
    labelSuffix,
    icon,
    description,
    disabled: controlledDisabled,
    helpText,
    isSelected,
    isLoading,
    multiSelect,
  } = props;
  const labelText = !description && !helpText;

  const disabled = isLoading ? false : controlledDisabled;

  return (
    <div className="flex w-full items-center gap-2">
      {multiSelect && (
        <>
          <input
            type="checkbox"
            className="hidden"
            checked={isSelected}
            onChange={() => {}}
          />
          <CheckboxIcon isChecked={Boolean(isSelected)} />
        </>
      )}
      {icon && (
        <div className={`[&>svg]:size-5 [&>svg]:text-default-light`}>
          {icon}
        </div>
      )}
      <div className="w-full overflow-hidden">
        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex w-full justify-between gap-8 overflow-hidden text-ellipsis ${labelText ? '' : 'font-semibold'} leading-8 ${disabled ? 'italic text-default-light' : ''} ${label === 'View All' && 'm-auto'}`}
          >
            {typeof label === 'string' &&
              (isSelected && !multiSelect ? (
                <div className="flex items-center gap-2">
                  <OverflowText text={label} placement="left" />
                  <CheckCircleIcon className="size-4 text-brand" />
                </div>
              ) : (
                <OverflowText text={label} placement="left" />
              ))}
            {typeof label !== 'string' && label}
            {labelSuffix}
          </div>
        </div>
        {(description || helpText) && (
          <div
            className={`flex w-full gap-1 text-xs  ${disabled ? 'italic text-disabled' : 'text-default-light'}`}
          >
            {description}
            <span className="ml-auto text-nowrap">{helpText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const CheckboxIcon = ({ isChecked }: { isChecked: boolean }) => {
  const className =
    'box-border size-6 rounded-[2px] border-brand text-brand hover:border-brand/100 hover:bg-brand/10';
  return isChecked ? (
    <div className="relative">
      <StopIconSolid className={className} />
      <CheckIcon className="absolute left-1.5 top-1.5 size-3 text-layer0" />
    </div>
  ) : (
    <StopIcon className={className} />
  );
};

export const countDescription: MenuItemProps = {
  type: 'label',
  label: 'Counts reflect total known items.',
  className: 'text-center -translate-y-4 h-0',
};
