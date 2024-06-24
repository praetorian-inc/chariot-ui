import { safeExecute } from '@/utils/function.util';
import { isEmpty } from '@/utils/lodash.util';

function queryStorageFn() {
  function getItem<T>(key: string): T | undefined {
    const url = getSearchParams();
    const value = url.searchParams.get(key);

    return safeExecute<T>(() => {
      return JSON.parse(value || '') as T;
    }, value as T);
  }

  function setItem<T>(key: string, value: T): void {
    const url = getSearchParams();

    if (isEmpty(value)) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    }

    window.history.replaceState({}, '', url.toString());
  }

  function removeItem(key: string) {
    const url = getSearchParams();

    url.searchParams.delete(key);
    window.history.replaceState({}, '', url.toString());
  }

  function getSearchParams() {
    return new URL(window.location.href);
  }

  function clear() {
    window.history.replaceState({}, '', '');
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
}

export const queryStorge = queryStorageFn();
