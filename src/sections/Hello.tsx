import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Snackbar } from '@/components/Snackbar';
import { useAuth } from '@/state/auth';
import { getRoute } from '@/utils/route.util';

const Hello: React.FC = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  const { backend, region, clientId, setCognitoAuthStates } = useAuth();
  const fqdn = `praetorian-${backend}.auth.${region}.amazoncognito.com`;

  useEffect(() => {
    if (code) {
      exchangeCodeForTokens(code);
    }
  }, [code]);

  const exchangeCodeForTokens = async (code: string) => {
    const params = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `https://${window.location.host}${getRoute(['hello'])}`,
    });

    try {
      const response = await fetch(`https://${fqdn}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        Snackbar({
          title: 'Failed to login',
          description: `HTTP error! status: ${response.status}`,
          variant: 'error',
        });
        navigate(getRoute(['login']));
      }

      const data: {
        access_token: string;
        id_token: string;
        refresh_token: string;
        expires_in: number;
      } = await response.json();

      if (data.id_token) {
        setCognitoAuthStates({
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        });
      } else {
        throw new Error('No id_token in response');
      }

      navigate(getRoute(['app']));
    } catch (err) {
      console.error('Failed to exchange code for tokens.', err);
    }
  };

  return null;
};

export default Hello;
