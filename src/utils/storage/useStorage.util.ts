import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { isEqual, PropertyPath } from '@/utils/lodash.util';
import { useGetComponentDidMount } from '@/utils/reactHooks.util';
import { appStorage, appStorageKey } from '@/utils/storage/appStorage.util';
import { queryStorge } from '@/utils/storage/queryStorage.util';

export enum StorageKey {
  AUTH = 'chariot.auth',
  SHOW_NEW_USER_SEED_MODAL = 'chariot.showNewUserSeedModal',
  DRAWER_COMPOSITE_KEY = 'drawerCompositeKey',
  HASH_SEARCH = 'hashSearch',
  GENERIC_SEARCH = 'q',
  POE = 'POE',
  RUNNING_JOBS = 'RUNNING_JOBS',
  ASESET_PRIORITY_FILTER = 'asset-priority',
}

interface UseStorageOptions<S> {
  key?: PropertyPath;
  queryKey?: string;
  parentState?: S;
  onParentStateChange?: Dispatch<SetStateAction<S>> | ((value: S) => void);
}

export function useStorage<S>(
  options: UseStorageOptions<S>,
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, () => void];

// eslint-disable-next-line no-redeclare
export function useStorage<S = undefined>(options: {
  key?: PropertyPath;
  queryKey?: string;
  parentState?: S;
  onParentStateChange?:
    | Dispatch<SetStateAction<S | undefined>>
    | ((value: S | undefined) => void);
}): [S | undefined, Dispatch<SetStateAction<S | undefined>>, () => void];

// eslint-disable-next-line no-redeclare
export function useStorage<S>(
  options: {
    key?: PropertyPath;
    queryKey?: string;
    parentState?: S;
    onParentStateChange?:
      | Dispatch<SetStateAction<S | undefined>>
      | ((value: S | undefined) => void);
  },
  initialState?: S | (() => S)
) {
  const {
    key: localStorageKey,
    queryKey,
    parentState,
    onParentStateChange,
  } = options;

  const componentDidMount = useGetComponentDidMount();

  const defaultValue = useMemo(() => {
    return parentState === undefined
      ? typeof initialState === 'function'
        ? (initialState as () => S)()
        : initialState
      : parentState;
  }, []);

  const [localValue, setLocalValue] = useState<S | undefined>(getDefaultValue);

  function updateStorage(value: S | undefined) {
    if (localStorageKey || queryKey) {
      if (isEqual(value, defaultValue)) {
        if (localStorageKey) {
          appStorage.removeItem(localStorageKey);
        }
        if (queryKey) {
          queryStorge.removeItem(queryKey);
        }
      } else {
        if (localStorageKey) {
          appStorage.setItem(localStorageKey, value);
        }
        if (queryKey) {
          queryStorge.setItem(queryKey, value);
        }
      }
    }
  }

  useEffect(() => {
    if (componentDidMount) {
      console.error(
        `useStorage: Key should not be changing after mount localStorageKey: ${JSON.stringify(localStorageKey)}, queryKey: ${queryKey}`
      );
    }
  }, [localStorageKey, queryKey]);

  function getDefaultValue() {
    if (localStorageKey || queryKey) {
      let localDefaultValue = defaultValue;

      if (localStorageKey) {
        localDefaultValue =
          appStorage.getItem<S>(localStorageKey) ?? localDefaultValue;
      }

      if (queryKey) {
        localDefaultValue =
          queryStorge.getItem<S>(queryKey) ?? localDefaultValue;
      }

      return localDefaultValue;
    }

    return defaultValue;
  }

  function setLocalValueFn(value: SetStateAction<S | undefined>) {
    if (typeof value === 'function') {
      setLocalValue(prevValue => {
        const updatedValue = (
          value as (prevState: S | undefined) => S | undefined
        )(prevValue);

        updateStorage(updatedValue);
        onParentStateChange?.(updatedValue);
        return updatedValue;
      });
    } else {
      updateStorage(value);
      onParentStateChange?.(value);
      setLocalValue(value);
    }
  }

  function resetValue() {
    updateStorage(defaultValue);
    onParentStateChange?.(defaultValue);
    setLocalValue(defaultValue);
  }

  useEffect(() => {
    function reload(event: StorageEvent) {
      if (event.key === appStorageKey) {
        if (localStorageKey) {
          setLocalValueFn(getDefaultValue);
        }
      }
    }

    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);

  useEffect(() => {
    if (parentState !== undefined) {
      if (!isEqual(parentState, localValue)) {
        setLocalValue(parentState);
      }
    }
  }, [parentState]);

  return [parentState ?? localValue, setLocalValueFn, resetValue];
}
