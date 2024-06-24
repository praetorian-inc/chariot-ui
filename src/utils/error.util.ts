import { capitalize } from '@/utils/lodash.util';

export function createError(errorMessage: string, title?: string) {
  const error = new Error(errorMessage);
  if (title) {
    error.name = title;
  }

  return error;
}

export function getError(error: Error | string | unknown): Error {
  if (error instanceof Error) {
    return {
      message: capitalize(error.message),
      name: capitalize(error?.name),
    };
  }

  return {
    message:
      typeof error === 'string' ? capitalize(error) : JSON.stringify(error),
    name: '',
  };
}
