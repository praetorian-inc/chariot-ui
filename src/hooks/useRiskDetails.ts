import { useAxios } from '@/hooks/useAxios';
import { useAuth } from '@/state/auth';
import { Risk } from '@/types';

const useRiskDetails = () => {
  const { token } = useAuth();
  const axios = useAxios();

  const fetchRiskDetails = async (email: string): Promise<Risk[]> => {
    const riskResponse = await axios({
      method: 'get',
      url: '/my?key=%23risk',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        account: email,
      },
    }).then(response => response.data.risks);

    return riskResponse;
  };

  return fetchRiskDetails;
};

export default useRiskDetails;
