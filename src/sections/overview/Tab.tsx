import { ReactNode } from 'react';
import React from 'react';

import { Button } from '@/components/Button';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

interface Tab<ID = string> {
  id: ID;
  label: ReactNode;
  content: ReactNode;
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

  if (props.tabs.length === 0) return null;

  return (
    <div className={cn('flex h-full', props.className)}>
      {tabLabels.length > 0 && (
        <div
          className={cn(
            'border-1 border-r-2 border-layer1 h-full',
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
                  'w-full rounded-none border-x-0 shadow-none',
                  tab.tabClassName,
                  index > 0 && 'mt-[-1px]'
                )}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedTabId(tab.id);
                }}
              >
                {tab.label}
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
        {props.tabs.map((tab, tabIndex) => {
          const isSelected = tab.id === selectedTabId;

          return (
            <div
              key={tabIndex}
              className={cn(
                'h-full w-full',
                !isSelected && 'hidden',
                tab?.contentClassName
              )}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
