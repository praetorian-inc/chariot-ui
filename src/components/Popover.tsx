import { PropsWithChildren } from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';

import { Button, ButtonProps } from '@/components/Button';
import { useStorage } from '@/utils/storage/useStorage.util';

interface PopoverProps extends ButtonProps, PropsWithChildren {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  placement?: Placement;
}

export const Popover = (props: PopoverProps) => {
  const {
    open: openParent,
    setOpen: setOpenParent,
    placement = 'bottom-start',
    children,
    ...rest
  } = props;
  const [open, setOpen] = useStorage(
    {
      onParentStateChange: setOpenParent,
      parentState: openParent,
    },
    false
  );

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(6),
      flip({ fallbackAxisSideDirection: 'end' }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

  return (
    <>
      <Button ref={refs.setReference} {...getReferenceProps()} {...rest} />
      {open && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            className="Popover border-1 z-20 rounded-[4px] border border-default bg-layer0 p-4 shadow-md outline-none"
            ref={refs.setFloating}
            style={floatingStyles}
            aria-labelledby={headingId}
            {...getFloatingProps()}
          >
            {children || props.label}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};
