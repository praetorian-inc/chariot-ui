/* eslint-disable @typescript-eslint/no-explicit-any */

type PropertyName = string | number | symbol;

type ObjectType = { [key: PropertyName]: any };

export type PropertyPath = PropertyName | readonly PropertyName[];

export function omit<T extends object, K extends PropertyName[]>(
  object: T | null | undefined,
  ...paths: K
): Pick<T, Exclude<keyof T, K[number]>> {
  if (object == null || object == undefined) {
    return {} as Pick<T, Exclude<keyof T, K[number]>>;
  }

  const result = { ...object };

  paths.forEach(path => {
    if (Array.isArray(path)) {
      path.forEach(subPath => {
        delete result[subPath as keyof T];
      });
    } else {
      delete result[path as keyof T];
    }
  });

  return result;
}

export function capitalize(str?: string): string {
  const lower = str?.toLowerCase();
  return lower ? lower.charAt(0).toUpperCase() + lower.slice(1) : '';
}

export const isObject = (obj?: any): boolean =>
  obj && obj !== null && typeof obj === 'object';

export function isEqual(obj1?: any, obj2?: any): boolean {
  if (isObject(obj1) && isObject(obj2)) {
    const keys1 = Object.keys(obj1 as ObjectType) as string[];
    const keys2 = Object.keys(obj2 as ObjectType) as string[];

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key1 of keys1) {
      const value1 = (obj1 as ObjectType)[key1];
      const value2 = (obj2 as ObjectType)[key1];

      if (!Object.prototype.hasOwnProperty.call(obj2, key1)) {
        return false;
      }

      if (isObject(obj1) && isObject(obj2)) {
        if (!isEqual(value1, value2)) {
          return false;
        }
      } else {
        if (value1 !== value2) {
          return false;
        }
      }
    }

    return true;
  } else {
    return obj1 === obj2;
  }
}

export function isEmpty(data?: any): boolean {
  return (
    data === null ||
    data === undefined ||
    data === '' ||
    (isObject(data) && !Object.keys(data).length)
  );
}
