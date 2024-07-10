import { PropsWithChildren } from 'react';
import { Tab } from '@headlessui/react';

import { cn } from '@/utils/classname';

interface Props extends PropsWithChildren {
  vertical?: boolean;
  value?: string | number | readonly string[];
  onClick?: () => void;
}

export const TabWrapper = ({ children, vertical, value, onClick }: Props) => {
  return (
    <Tab
      value={value}
      onClick={onClick}
      className={({ selected }) =>
        cn(
          'w-full py-4 px-2 text-sm font-semibold leading-5 hover:bg-gray-50 focus:outline-0',
          (vertical || !selected) && 'border-b-2 border-gray-100 bg-layer0',
          vertical && selected && 'bg-layer1',
          !vertical && selected && 'border-b-4 border-brand text-brand'
        )
      }
    >
      {children}
    </Tab>
  );
};
