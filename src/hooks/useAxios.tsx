import { useMemo } from 'react';
import axios from 'axios';

import { useAuth } from '@/state/auth';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAxios = () => {
  return axiosInstance;
};

export function useInitAxiosInterceptors() {
  const { friend, api, getToken } = useAuth();

  useMemo(() => {
    axiosInstance.defaults.baseURL = api ?? '';
    axiosInstance.defaults.headers.common['account'] =
      friend.email && friend.email !== '' ? friend.email : undefined;

    axiosInstance.interceptors.request.use(
      async config => {
        try {
          // Get the current session from Amplify Auth
          const token = await getToken();

          // Add the token to the request headers
          config.headers.Authorization = token ? `Bearer ${token}` : '';
        } catch (error) {
          console.error('Error getting Amplify token', error);
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }, [friend, api]);
}
