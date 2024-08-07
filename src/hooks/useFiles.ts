import { toast } from 'sonner';

import {
  PROFILE_PICTURE_ID,
  useGetProfilePictureUrl,
} from '@/hooks/profilePicture';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { queryClient } from '@/queryclient';
import { useAuth } from '@/state/auth';
import { UseExtendQueryOptions, useMutation, useQuery } from '@/utils/api';
import { isArrayBufferEmpty } from '@/utils/misc.util';
interface ProgressEventDetails {
  loaded: number;
  total: number;
  percent: number;
}

interface UploadFilesProps {
  name: string;
  content: string | ArrayBuffer;
  ignoreSnackbar?: boolean;
  onProgress?: (progressEvent: ProgressEventDetails) => void;
}

export function useUploadFile() {
  const axios = useAxios();
  const { me } = useAuth();

  const { invalidate: invalidateMyFiles } = useMy(
    { resource: 'file' },
    { enabled: false }
  );

  const { invalidate: invalidateProfilePicture } = useGetProfilePictureUrl(
    { email: me },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: 'Failed to Upload file',
    mutationFn: async (props: UploadFilesProps) => {
      const res = await axios.put(`/file`, null, {
        params: {
          name: props.name,
        },
      });

      const uploadUrl = res.data.url;

      if (!uploadUrl) {
        throw new Error('Failed to upload file');
      }

      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);

        // Attach the progress event handler
        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          if (props.onProgress && event.lengthComputable) {
            const progress: ProgressEventDetails = {
              loaded: event.loaded,
              total: event.total,
              percent: (event.loaded / event.total) * 100,
            };
            props.onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Failed to upload file'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.send(props.content);
      });

      toast.promise(uploadPromise, {
        loading: `Uploading ${props.name}...`,
        success: `${props.name} uploaded`,
        error: `Failed to upload ${props.name}`,
      });
      await uploadPromise;
      return null;
    },
    onSuccess: (_, variable) => {
      invalidateMyFiles();
      queryClient.invalidateQueries({
        queryKey: getQueryKey.getFile({ name: variable.name }),
      });
      if (!variable.ignoreSnackbar) {
        if (variable.name === PROFILE_PICTURE_ID) {
          invalidateProfilePicture();
        }
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

export function useOpenFile() {
  const axios = useAxios();

  return useMutation({
    defaultErrorMessage: 'Failed to load file',
    mutationFn: async (props: DownloadFilesProps) => {
      try {
        const res = await axios.get(`/file`, {
          params: {
            name: props.name,
          },
          responseType: 'blob',
        });

        return res.data;
      } catch (error) {
        console.log('retrying', error);
      }
    },
  });
}

export interface GetFilesProps {
  name?: string;
}

export function useGetFile(
  props: GetFilesProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseExtendQueryOptions<any> & {
    responseType?: import('axios').ResponseType;
    getBlobType?: string;
  }
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
          responseType: options?.responseType,
        });

        if (options?.getBlobType) {
          if (options?.responseType === 'arraybuffer') {
            if (!isArrayBufferEmpty(res.data || '""')) {
              return URL.createObjectURL(
                new Blob([res.data], { type: 'options?.getBlobType' })
              );
            }
          } else {
            if (res.data) {
              return URL.createObjectURL(
                new Blob([res.data], { type: options?.getBlobType })
              );
            }
          }
        } else {
          return res.data;
        }
      } catch (e) {
        return '';
      }
    },
    enabled: options?.enabled ?? Boolean(props.name),
  });
}
