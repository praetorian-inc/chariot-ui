import { cloneElement, forwardRef, isValidElement } from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  hide,
  offset,
  Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
} from '@floating-ui/react';

import { Button, ButtonProps } from '@/components/Button';
import { Menu, MenuProps } from '@/components/Menu';
import { useStorage } from '@/utils/storage/useStorage.util';

export interface DropdownMenu extends MenuProps {
  placement?: Placement;
  onClose?: () => void;
  width?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DropdownProps extends ButtonProps {
  menu: DropdownMenu;
  asChild?: boolean;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  function Dropdown(props: DropdownProps, ref) {
    const { menu, asChild, ...buttonProps } = props;
    const { placement = 'bottom-start', onClose, ...menuProps } = menu;

    const [open, setOpen] = useStorage(
      { onParentStateChange: menu.onOpenChange, parentState: menu.open },
      false
    );

    const floatingProps = useFloating({
      placement,
      open,
      onOpenChange: (open: boolean) => {
        if (!open) {
          onClose?.();
        }

        setOpen(open);
      },
      whileElementsMounted(referenceEl, floatingEl, update) {
        const cleanup = autoUpdate(referenceEl, floatingEl, update, {
          animationFrame: true,
        });
        return cleanup;
      },
      middleware: [
        hide({
          strategy: 'referenceHidden',
        }),
        offset(10),
        flip({
          crossAxis: false,
          mainAxis: true,
          padding: 10,
        }),
        shift({
          crossAxis: false,
          mainAxis: true,
          padding: 10,
        }),
        size({
          padding: 10,
          apply({ availableHeight, elements }) {
            elements.floating.style.maxHeight = `${availableHeight}px`;
          },
        }),
      ],
    });

    const click = useClick(floatingProps.context);
    const dismiss = useDismiss(floatingProps.context);
    const role = useRole(floatingProps.context);

    const interactions = useInteractions([click, dismiss, role]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenRef = (props?.children as any)?.ref;
    const triggerRef = useMergeRefs([
      floatingProps.refs.setReference,
      ref,
      childrenRef,
    ]);

    return (
      <>
        {asChild && isValidElement(props.children) ? (
          cloneElement(
            props.children as React.ReactElement,
            interactions.getReferenceProps({
              ref: triggerRef,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(props.children as unknown as any).props,
            })
          )
        ) : (
          <Button
            ref={triggerRef}
            {...interactions.getReferenceProps(buttonProps)}
          />
        )}
        {open && (
          <FloatingPortal>
            <FloatingFocusManager
              context={floatingProps.context}
              modal={false}
              initialFocus={-1}
            >
              <div
                ref={floatingProps.refs.setFloating}
                style={{
                  ...floatingProps.floatingStyles,
                  width: menuProps.width,
                  visibility: floatingProps.middlewareData.hide?.referenceHidden
                    ? 'hidden'
                    : 'visible',
                }}
                className="z-20 flex outline-none"
                {...interactions.getFloatingProps()}
              >
                <Menu
                  {...menuProps}
                  onClick={updatedValue => {
                    menuProps?.onClick?.(updatedValue);

                    if (!menuProps.multiSelect) {
                      setOpen(false);
                    }
                  }}
                />
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </>
    );
  }
);
