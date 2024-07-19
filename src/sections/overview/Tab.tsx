import { ReactNode } from 'react';
import React from 'react';

import { Button } from '@/components/Button';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

interface Tab<ID = string> {
  id: ID;
  label: ReactNode;
  Content: React.ElementType;
  contentProps?: object;
  tabClassName?: string;
  contentClassName?: string;
}

export interface TabsProps<ID = string> {
  tabs: Tab<ID>[];
  defaultValue?: ID;
  value?: ID;
  onChange?: (value: ID) => void;
  className?: string;
  tabWrapperclassName?: string;
  contentWrapperClassName?: string;
}

export function Tabs<ID = string>(props: TabsProps<ID>) {
  const defaultTab = props.defaultValue || props.tabs[0]?.id;

  const [selectedTabId, setSelectedTabId] = useStorage(
    {
      parentState: props.value,
      onParentStateChange: props.onChange,
    },
    defaultTab
  );

  const tabLabels = props.tabs.filter(tab => tab.label);
  const selectedTab = props.tabs.find(tab => tab.id === selectedTabId);

  if (props.tabs.length === 0) return null;

  return (
    <div className={cn('flex h-full', props.className)}>
      {tabLabels.length > 0 && (
        <div
          className={cn(
            'border-r-2 border-t border-layer1 h-full',
            props.tabWrapperclassName
          )}
        >
          {tabLabels.map((tab, index) => {
            const isSelected = tab.id === selectedTabId;

            if (!tab.label) return null;

            return (
              <Button
                key={index}
                styleType="secondary"
                className={cn(
                  'w-full rounded-none border-x-0 shadow-none text-nowrap',
                  tab.tabClassName,
                  index > 0 && 'mt-[-1px]'
                )}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedTabId(tab.id);
                }}
              >
                <p className="w-full ">{tab.label}</p>
              </Button>
            );
          })}
        </div>
      )}
      <div
        className={cn(
          'w-full px-4 overflow-auto h-full',
          props?.contentWrapperClassName
        )}
      >
        {selectedTab && <selectedTab.Content {...selectedTab.contentProps} />}
      </div>
    </div>
  );
}
