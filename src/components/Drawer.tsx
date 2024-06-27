import { ReactNode, useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

import { MODAL_WRAPPER_ID } from '@/components/Modal';
import { useMutationObserver } from '@/hooks/useMutationObserver';
import { cn } from '@/utils/classname';
import { getTransitionSettings } from '@/utils/transition.util';
import { Tooltip } from '@/components/Tooltip';

interface Props {
  position?: 'left' | 'right';
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  children: React.ReactNode;
  zIndex?: number;
  className?: string;
  footer?: ReactNode;
  footerClassname?: string;
}

export function Drawer({
  position = 'right',
  open,
  onClose,
  onBack,
  children,
  zIndex,
  className,
  footer,
  footerClassname,
}: Props) {
  const [domHasModal, setDomHasModal] = useState(false);

  /**
   * Listen to the DOM changes to check if the modal is added or removed
   */
  useMutationObserver(
    document.body,
    mutations => {
      const modalIsAdded = Array.from(mutations).some(
        mutation =>
          mutation.type === 'childList' &&
          Array.from(mutation.addedNodes).some(node => {
            return (node as Element).id === MODAL_WRAPPER_ID;
          })
      );

      const modalIsRemoved = Array.from(mutations).some(
        mutation =>
          mutation.type === 'childList' &&
          Array.from(mutation.removedNodes).some(node => {
            return (node as Element).id === MODAL_WRAPPER_ID;
          })
      );

      modalIsAdded && setDomHasModal(true);
      modalIsRemoved && setDomHasModal(false);
    },
    { childList: true }
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      event.stopPropagation();
      if (event.key === 'Escape') {
        onClose();
      }
    }

    /**
     * Modal and Drawer both listens to the escape key press event
     * If the modal is open, we don't want the drawer to listen to the escape key press event
     */
    if (open && !domHasModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, domHasModal]);

  return (
    <Transition appear show={open} as={Fragment}>
      <div
        className={twMerge('relative', !zIndex && 'z-10')}
        style={{ zIndex }}
        onClick={onClose}
      >
        <Transition.Child
          as={Fragment}
          {...getTransitionSettings({ type: 'fade' })}
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 h-full">
          <div
            className={`flex h-full ${position === 'right' ? 'justify-end' : 'justify-start'}`}
          >
            <Transition.Child
              as={Fragment}
              {...getTransitionSettings({
                type: position === 'right' ? 'slideRight' : 'slideLeft',
              })}
            >
              <div
                className={cn(
                  'border-l border-l-default relative flex flex-col bg-layer0 w-96',
                  className
                )}
                onClick={event => event.stopPropagation()}
              >
                <div className="flex h-full flex-col overflow-y-auto px-8 py-6">
                  <div className="mb-7 flex justify-between">
                    <Tooltip title="Go Back">
                      <ChevronLeftIcon
                        className="size-5 cursor-pointer"
                        onClick={onBack}
                      />{' '}
                    </Tooltip>
                    <Tooltip title="Close">
                      <XMarkIcon
                        className="size-5 cursor-pointer"
                        onClick={onClose}
                      />
                    </Tooltip>
                  </div>
                  {children}
                </div>
                {footer && (
                  <div className={cn('w-full bg-layer1 p-3', footerClassname)}>
                    {footer}
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition>
  );
}
