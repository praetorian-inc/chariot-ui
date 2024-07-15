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
  const { api, token, friend } = useAuth();

  useMemo(() => {
    axiosInstance.defaults.baseURL = api ?? '';
    axiosInstance.defaults.headers.common['Authorization'] = token
      ? `Bearer ${token}`
      : '';
    axiosInstance.defaults.headers.common['account'] =
      friend.email && friend.email !== '' ? friend.email : undefined;
  }, [api, token, friend]);
}
