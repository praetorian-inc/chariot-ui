import { FileResult } from '@/components/Dropzone';
import { Snackbar } from '@/components/Snackbar';
import { queryClient } from '@/queryclient';
import { UseExtendQueryOptions, useMutation, useQuery } from '@/utils/api';

import { useAxios } from './useAxios';
import { useMy } from './useMy';
import { getQueryKey } from './useQueryKeys';

interface UploadFilesProps {
  name: string;
  content: FileResult;
  ignoreSnackbar?: boolean;
}

export function useUploadFile() {
  const axios = useAxios();

  const { invalidate: invalidateMyFiles } = useMy(
    { resource: 'file' },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: `Failed to Upload file`,
    mutationFn: (props: UploadFilesProps) => {
      return axios.put(`/file`, props.content, {
        params: {
          name: props.name,
        },
      });
    },
    onSuccess: (_, variable) => {
      invalidateMyFiles();
      queryClient.invalidateQueries({
        queryKey: getQueryKey.getFile({ name: variable.name }),
      });
      if (!variable.ignoreSnackbar) {
        Snackbar({
          variant: 'success',
          title: `File "${variable.name}" uploaded successfully`,
          description: '',
        });
      }
    },
  });
}

interface DownloadFilesProps {
  name: string;
}

export function useDownloadFile() {
  const axios = useAxios();

  return useMutation({
    defaultErrorMessage: `Failed to download file`,
    mutationFn: async (props: DownloadFilesProps) => {
      const res = await axios.get(`/file`, {
        params: {
          name: props.name,
        },
        responseType: 'arraybuffer',
      });

      const blob = new Blob([res.data], { type: 'application/octet-stream' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.name.split('/').pop()?.split(':')[0] || props.name;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

interface GetFileSignedURLProps {
  name: string;
}

export async function useGetFileSignedURL(props: GetFileSignedURLProps) {
  const axios = useAxios();

  return (
    await axios.get(`/file`, {
      params: {
        name: props.name,
      },
      responseType: 'arraybuffer',
    })
  ).request.responseURL;
}

export interface GetFilesProps {
  name?: string;
}

export function useGetFile(
  props: GetFilesProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseExtendQueryOptions<any>
) {
  const axios = useAxios();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<any>({
    ...options,
    defaultErrorMessage: `Failed to get file`,
    retry: 0,
    queryKey: getQueryKey.getFile(props),
    queryFn: async () => {
      try {
        const res = await axios.get(`/file`, {
          params: {
            name: props.name,
          },
        });

        return res.data;
      } catch (e) {
        return '';
      }
    },
    enabled: options?.enabled ?? Boolean(props.name),
  });
}
