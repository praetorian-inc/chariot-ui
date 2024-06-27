import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';

import { cn } from '@/utils/classname';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const displayBackends = [
  {
    name: 'United States - East',
    location: 'Richmond, VA',
    flag: 'https://hatscripts.github.io/circle-flags/flags/us.svg',
    available: true,
  },
  {
    name: 'United States - West',
    location: 'San Francisco, CA',
    flag: 'https://hatscripts.github.io/circle-flags/flags/us.svg',
    available: false,
  },
  {
    name: 'Western Europe',
    location: 'Dublin, Ireland',
    flag: 'https://hatscripts.github.io/circle-flags/flags/ie.svg',
    available: false,
  },
];

export default function BackendSelector() {
  return (
    <Menu as="div" className="relative inline-block w-full">
      <div>
        <div className="font-sm mb-2 font-medium">Select a Region</div>
        <MenuButton className="flex w-full rounded-[4px] border border-gray-300 p-3 px-6 text-center transition duration-300 ease-in-out hover:bg-layer2">
          <span className="flex w-full items-center text-left">
            <img
              src="https://hatscripts.github.io/circle-flags/flags/us.svg"
              width="16"
              className="mr-2"
            />
            United States - East
          </span>
          <ChevronDownIcon className="-mr-1 ml-2 size-5" aria-hidden="true" />
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute z-10 mt-2 w-full rounded-[2px] bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {displayBackends.map(backend => (
              <MenuItem key={backend.name}>
                {({ focus }) => (
                  <button
                    type="button"
                    disabled={!backend.available}
                    className={classNames(
                      focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-6 py-2 text-center disabled:grayscale'
                    )}
                  >
                    <div className="flex w-full items-center text-left">
                      <img
                        src={backend.flag}
                        width="24"
                        className={cn(
                          'mr-2',
                          !backend.available && 'opacity-50'
                        )}
                      />
                      <div
                        className={cn(
                          'flex flex-col',
                          !backend.available && 'text-disabled opacity-50'
                        )}
                      >
                        <p>{backend.name}</p>
                        <p className="text-xs text-disabled disabled:opacity-30">
                          {backend.location}
                        </p>
                      </div>
                      {!backend.available && (
                        <p className="ml-auto rounded-full bg-header-dark px-3 py-1 text-xs font-medium uppercase text-layer0 opacity-100">
                          Coming Soon
                        </p>
                      )}
                    </div>
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
