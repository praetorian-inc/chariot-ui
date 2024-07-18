import React, {
  Fragment,
  PropsWithChildren,
  ReactNode,
  useEffect,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

import { Button, ButtonProps } from '@/components/Button';
import { cn } from '@/utils/classname';
import { getTransitionSettings } from '@/utils/transition.util';

type Size = 'sm' | 'md' | 'lg' | 'xl';
interface Props extends PropsWithChildren {
  className?: string;
  footer?: {
    styleType?: ButtonProps['styleType'];
    text?: string;
    onClick?: () => void;
    left?: JSX.Element;
    form?: string;
    className?: string;
    isLoading?: boolean;
    startIcon?: React.ReactNode;
    disabled?: boolean;
    disconnect?: {
      text?: string;
      onClick?: () => void;
      disabled?: boolean;
      isLoading?: boolean;
    };
  };
  logo?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  open: boolean;
  size?: Size;
  title: ReactNode;
  subtitle?: ReactNode;
  style?: 'default' | 'dialog';
  closeOnOutsideClick?: boolean;
}

/**
 * This is Portal ID where headless UI renders the Dialog
 * Ref: https://headlessui.com/react/dialog#rendering-to-a-portal
 */
export const MODAL_WRAPPER_ID = 'headlessui-portal-root';

export const Modal: React.FC<Props> = props => {
  const {
    children,
    className = '',
    footer = undefined,
    onClose = () => {},
    logo = '',
    subtitle = '',
    open = false,
    size = 'md',
    title = '',
    icon,
    style = 'default',
    closeOnOutsideClick = true,
  } = props;
  const isDialog = style === 'dialog';

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      event.stopPropagation();

      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <ModalWrapper
      open={open}
      size={size}
      onClose={onClose}
      closeOnOutsideClick={closeOnOutsideClick}
    >
      <div className={cn(isDialog && 'p-6')}>
        <Dialog.Title
          className={cn(
            'flex justify-between rounded-t-lg text-lg font-semibold',
            !isDialog && 'bg-layer1 pl-6 py-2'
          )}
        >
          <div className="flex w-full items-center justify-center">
            {logo && (
              <img
                src={logo}
                alt={'modal-logo'}
                className="mr-2 inline size-12"
              />
            )}
            {icon && (
              <div className="flex size-10 shrink-0 items-center justify-center">
                {icon}
              </div>
            )}
            <div className="w-full">
              {title}
              {subtitle && <p className="text-sm text-default">{subtitle}</p>}
            </div>
          </div>
          {!isDialog && (
            <Button aria-label="CloseIcon" onClick={onClose} styleType="none">
              <XMarkIcon className="size-6" />
            </Button>
          )}
        </Dialog.Title>
        <div
          className={cn(
            'py-5 px-6',
            isDialog && 'px-10 py-2',
            isDialog && !icon && 'px-0',
            className
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            'flex justify-between rounded-b-lg',
            !isDialog && 'border-t border-t-default bg-layer1 px-6 py-3',
            isDialog && 'pt-6'
          )}
        >
          <div>
            {footer?.left}
            {footer?.disconnect && (
              <Button
                onClick={footer?.disconnect?.onClick}
                styleType="secondary"
                className={cn(
                  ' text-red-700 hover:bg-layer0',
                  footer?.className
                )}
                isLoading={footer?.disconnect?.isLoading}
                disabled={footer?.disconnect?.disabled}
              >
                {footer?.disconnect?.text}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              styleType="secondary"
              className="!m-0 w-24 bg-layer0 hover:bg-layer0"
            >
              Cancel
            </Button>

            {footer?.text && (
              <Button
                onClick={footer?.onClick}
                startIcon={footer?.startIcon}
                styleType={footer.styleType || 'primary'}
                className={cn('ml-2 w-24', footer?.className)}
                form={footer?.form}
                type={footer?.form ? 'submit' : undefined}
                isLoading={footer?.isLoading}
                disabled={footer?.disabled}
              >
                {footer.text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

interface ModalWrapperProps extends PropsWithChildren {
  className?: string;
  open: boolean;
  size?: Size;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = props => {
  const {
    children,
    className = '',
    onClose = () => {},
    open = false,
    size = 'md',
    closeOnOutsideClick = true,
  } = props;

  const widthMap = {
    sm: 'max-w-xs',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-6xl',
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20"
        onClose={closeOnOutsideClick ? onClose : () => null}
      >
        <Transition.Child
          as={Fragment}
          {...getTransitionSettings({ type: 'fade' })}
        >
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/80"
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center text-default">
            <Transition.Child
              as={Fragment}
              {...getTransitionSettings({ type: 'scale' })}
            >
              <Dialog.Panel
                className={cn(
                  `w-full border border-default ${widthMap[size]} rounded-[2px] bg-layer0 text-left transition-all`,
                  className
                )}
              >
                <div className="">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
