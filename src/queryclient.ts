import { QueryClient } from '@/utils/api';
import { mToMs } from '@/utils/date.util';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: mToMs(5) } },
});
