import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import {
  confirmSignUp,
  fetchAuthSession,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { toast } from 'sonner';

import { queryClient } from '@/queryclient';
import { AuthContextType, AuthState, BackendStack } from '@/types';
import { Regex } from '@/utils/regex.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

export const REGION_REGEX = /.*execute-api.(.*).amazonaws/;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultStack: BackendStack = {
  backend: 'chariot',
  api: 'https://d0qcl2e18h.execute-api.us-east-2.amazonaws.com/chariot',
  clientId: '795dnnr45so7m17cppta0b295o',
  userPoolId: 'us-east-2_BJ6QHVG2L',
};

export const emptyAuth: AuthState = {
  ...defaultStack,
  friend: { email: '', displayName: '' },
  isImpersonating: false,
  me: '',
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const [auth, setAuth] = useStorage<AuthState>(
    { key: StorageKey.AUTH },
    emptyAuth
  );

  const backendStack = {
    api: auth.api,
    backend: auth.backend,
    clientId: auth.clientId,
    userPoolId: auth.userPoolId,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isTokenFetching, setIsTokenFetching] = useState(true);

  function startImpersonation(memberId: string, displayName: string) {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: { email: memberId, displayName: displayName },
      };
    });
    window.location.assign('/app/overview');
  }

  function stopImpersonation() {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: { email: '', displayName: '' },
      };
    });
    window.location.assign('/app/account');
  }

  async function login(username = '', password = '') {
    try {
      if (username && password) {
        setIsLoading(true);
        await signIn({
          username,
          password,
        });
      }
    } catch (error) {
      error instanceof Error && error.message && setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(username = '', password = '', gotoNext = () => {}) {
    try {
      setIsLoading(true);
      const { isSignUpComplete, nextStep } = await signUp({
        username,
        password,
      });
      const { signUpStep } = nextStep;
      if (!isSignUpComplete && signUpStep === 'CONFIRM_SIGN_UP') {
        gotoNext && gotoNext();
      }
    } catch (error) {
      error instanceof Error && error.message && setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmOTP(username = '', password = '', otp: string = '') {
    try {
      setIsLoading(true);
      const response = await confirmSignUp({
        username,
        confirmationCode: otp,
      });
      if (response.isSignUpComplete) {
        login(username, password);
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error('Failed to confirm OTP');
        console.error(error);
      }
      setIsLoading(false);
    }
  }

  async function fetchUserEmail() {
    setIsTokenFetching(true);
    const session = await fetchAuthSession();

    if (session.tokens) {
      console.log('Fetched user email', {
        currentDate: new Date(),
      });

      const ssoDomain = (
        session.tokens?.idToken?.payload?.identities as unknown as {
          providerName: string;
        }[]
      )?.[0]?.providerName;

      const ssoUsername = `sso@${ssoDomain}`;

      setAuth(auth => ({
        ...auth,
        me:
          session.tokens?.idToken?.payload?.email?.toString() ??
          ssoUsername ??
          '',
      }));
    }
    setIsTokenFetching(false);
  }

  async function logout() {
    await signOut();
  }

  function setBackendStack(backendStack: BackendStack = defaultStack) {
    initAmplify(backendStack);

    setAuth(prevAuth => ({
      ...prevAuth,
      ...backendStack,
    }));
  }

  async function getToken() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() ?? '';

    return token;
  }

  useEffect(() => {
    const stopListen = Hub.listen('auth', async ({ payload }) => {
      console.log('Hub', payload);

      switch (payload.event) {
        case 'signedIn': {
          await fetchUserEmail();
          navigate('/');

          break;
        }

        case 'signedOut':
          console.log('user have been signedOut successfully.', payload);
          queryClient.clear();
          setAuth(auth => {
            const backendStack = {
              api: auth.api,
              backend: auth.backend,
              clientId: auth.clientId,
              userPoolId: auth.userPoolId,
            };

            return {
              ...emptyAuth,
              ...backendStack,
            };
          });
          navigate(getRoute(['login']));

          break;
        case 'tokenRefresh':
          console.log('auth tokens have been refreshed.', payload);

          break;
        case 'tokenRefresh_failure':
          console.error('failure while refreshing auth tokens.', payload);

          toast.error('Session expired, Please login again.');
          logout();
          break;
        case 'signInWithRedirect_failure':
          console.error(
            'failure while trying to resolve signInWithRedirect API.',
            payload
          );
          break;
      }
    });

    fetchUserEmail();

    return () => {
      stopListen();
    };
  }, []);

  useMemo(() => {
    setBackendStack(backendStack);
  }, [JSON.stringify(backendStack)]);

  if (isTokenFetching) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        getToken,
        error,
        setError,
        confirmOTP,
        isImpersonating: auth.friend.email !== '',
        isLoading,
        login,
        logout,
        signup,
        startImpersonation,
        stopImpersonation,
        setBackendStack,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context in any functional component
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthProvider;

const initAmplify = (stack: BackendStack = defaultStack) => {
  const { clientId, userPoolId, api, backend } = stack;

  const region = Regex.AWS_REGION_REGEX.exec(api)?.[1] ?? 'us-east-2';

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: clientId,
        userPoolId,
        loginWith: {
          oauth: {
            domain: `praetorian-${backend}.auth.${region}.amazoncognito.com`,
            scopes: ['email', 'openid'],
            redirectSignIn: [
              'https://localhost:3000/hello',
              'https://preview.chariot.praetorian.com/hello',
            ],
            redirectSignOut: [
              'https://localhost:3000/goodbye',
              'https://preview.chariot.praetorian.com/goodbye',
            ],
            responseType: 'code',
          },
        },
      },
    },
    API: {
      REST: {
        [backend]: {
          endpoint: api,
          region,
        },
      },
    },
  });
};
