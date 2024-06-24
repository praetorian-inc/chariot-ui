import { safeExecute } from '@/utils/function.util';
import { isLocalhost } from '@/utils/location.util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encode(value: any) {
  const stringValue = JSON.stringify(value);

  return isLocalhost ? stringValue : btoa(stringValue);
}

export function decode<T>(value: string, defaultValue: T): T;
// eslint-disable-next-line no-redeclare
export function decode<T>(value: string, defaultValue?: T): T | undefined;

// eslint-disable-next-line no-redeclare
export function decode<T>(value: string, defaultValue?: T) {
  return safeExecute<T>(() => {
    return JSON.parse(isLocalhost ? value : atob(value)) as T;
  }, defaultValue);
}
