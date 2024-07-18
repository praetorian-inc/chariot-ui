import { ReactNode, useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

import { MODAL_WRAPPER_ID } from '@/components/Modal';
import { Tooltip } from '@/components/Tooltip';
import { useMutationObserver } from '@/hooks/useMutationObserver';
import { cn } from '@/utils/classname';
import { getTransitionSettings } from '@/utils/transition.util';

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
  header?: ReactNode;
  minWidth?: number;
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
  header,
  minWidth = 600,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // const { size, onMouseDown } = useResize({
  //   el: ref.current || document.createElement('div'),
  //   minWidth,
  //   position: 'right',
  // });
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
                  'relative border-l border-l-default flex flex-col bg-layer0 w-96',
                  className
                )}
                onClick={event => event.stopPropagation()}
                style={{
                  width: minWidth,
                }}
                ref={ref}
              >
                {/* <div
                  onMouseDown={onMouseDown}
                  className="absolute left-[-20px] top-1/2 flex size-5 h-8 -translate-y-2/4 translate-x-2/4 items-center rounded-full bg-layer1 shadow-md hover:cursor-col-resize"
                >
                  <EllipsisVerticalIcon className="w-6" />
                </div> */}
                <div className="h-full overflow-auto">
                  <div className="mx-2 my-4 flex justify-between">
                    <div className="flex">
                      <Tooltip title="Go Back">
                        <ChevronLeftIcon
                          className="mr-2 mt-2 size-5 cursor-pointer"
                          onClick={onBack}
                        />{' '}
                      </Tooltip>
                      {header}
                    </div>
                    <Tooltip title="Close">
                      <XMarkIcon
                        className=" mt-2 size-5 cursor-pointer"
                        onClick={onClose}
                      />
                    </Tooltip>
                  </div>
                  <div className="">{children}</div>
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
