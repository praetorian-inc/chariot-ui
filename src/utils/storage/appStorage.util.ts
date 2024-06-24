import { decode, encode } from '@/utils/encrypt.util';
import { PropertyPath } from '@/utils/lodash.util';

export const appStorageKey = 'appStorage';

function appStorageFn() {
  function getItem<T>(key: PropertyPath): T | undefined {
    const item = localStorage.getItem(getPropertyPathString(key)) || '';

    return decode<T>(item);
  }

  function setItem<T>(key: PropertyPath, value: T): void {
    localStorage.setItem(getPropertyPathString(key), encode(value));
  }

  function removeItem(key: PropertyPath) {
    localStorage.removeItem(getPropertyPathString(key));
  }

  function clear() {
    for (const key in localStorage) {
      if (localStorage.getItem(key) && key.startsWith(appStorageKey)) {
        localStorage.removeItem(key);
      }
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
}

export const appStorage = appStorageFn();

function getPropertyPathString(propertyPath: PropertyPath): string {
  if (Array.isArray(propertyPath)) {
    return [appStorageKey, ...propertyPath].join('.');
  }

  return `${appStorageKey}.${propertyPath.toString()}`;
}
