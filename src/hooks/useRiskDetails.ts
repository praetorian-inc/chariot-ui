import { useAxios } from '@/hooks/useAxios';
import { useAuth } from '@/state/auth';

const useRiskDetails = () => {
  const { getToken } = useAuth();

  const axios = useAxios();

  const fetchRiskDetails = async (
    email: string
  ): Promise<{ filename: string; fileData: Blob }> => {
    const token = await getToken();

    const initialResponse = await axios({
      method: 'get',
      url: '/risk/export',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        account: email,
      },
    });

    const filename = initialResponse.data.file;

    const fileResponse = await axios({
      method: 'get',
      url: '/file',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        account: email,
      },
      params: {
        name: filename,
      },
      responseType: 'blob',
    });

    return { filename, fileData: fileResponse.data };
  };

  return fetchRiskDetails;
};

export default useRiskDetails;
