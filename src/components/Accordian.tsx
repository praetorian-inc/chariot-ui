import { ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

interface AccordianProps {
  title: ReactNode;
  titlerightContainer?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  fixed?: boolean;
  icon?: ReactNode;
}

export function Accordian(props: AccordianProps) {
  const [open, setOpen] = useStorage(
    { parentState: props.open, onParentStateChange: props.onOpenChange },
    props.defaultOpen ?? true
  );

  return (
    <div className={cn('bg-brand-lighter', props.className)}>
      <div className="flex items-center">
        <div
          className={cn('flex gap-2 p-4', !props.fixed && 'cursor-pointer')}
          onClick={
            props.fixed
              ? undefined
              : () => {
                  setOpen(!open);
                }
          }
        >
          {!props.fixed && (
            <ChevronUpIcon
              className={cn(
                'size-4 stroke-[3px] text-default-dark transition-transform duration-150 select-none',
                !open && 'rotate-180'
              )}
            />
          )}
          {props.icon}
          <h6 className="font-bold leading-none">{props.title}</h6>
        </div>
        <div className="ml-auto">{props.titlerightContainer}</div>
      </div>
      {open && (
        <div className={cn('pl-10 pr-4 pb-4', props.contentClassName)}>
          {props.children}
        </div>
      )}
    </div>
  );
}
