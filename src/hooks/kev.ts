// eslint-disable-next-line no-restricted-imports

import { useGetFile } from '@/hooks/useFiles';

export function useGetKev() {
  return useGetFile({
    name: `cti/kev`,
  });
}
