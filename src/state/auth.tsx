import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { appStorage } from '@/utils/storage/appStorage.util';
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
  friend: '',
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

  const [isLoading, setIsLoading] = useState(false);
  const [isTokenFetching, setIsTokenFetching] = useState(true);

  function startImpersonation(memberId: string) {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: memberId,
      };
    });
    window.location.assign('/app/overview');
  }

  function stopImpersonation() {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: '',
      };
    });
    window.location.assign('/app/account');
  }

  async function login(username: string, password: string) {
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

      setAuth(prevAuth => ({
        ...prevAuth,
        me:
          session.tokens?.idToken?.payload?.email?.toString() ??
          ssoUsername ??
          '',
      }));
    }
    setIsTokenFetching(false);
  }

  async function logout() {
    try {
      await signOut();
    } catch {
      // Do nothing
    }

    queryClient.clear();
    setAuth(emptyAuth);
    navigate(getRoute(['login']));
  }

  function setBackendStack(backendStack?: BackendStack) {
    initAmplify(backendStack);

    setAuth(prevAuth => ({
      ...prevAuth,
      ...backendStack,
    }));
  }

  async function getToken() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() ?? '';

    if (!token) {
      toast.error('Init token missing');

      logout();
    }

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
        case 'signedOut': {
          console.log('user have been signedOut successfully.', payload);

          break;
        }
        case 'tokenRefresh': {
          console.log('auth tokens have been refreshed.', payload);

          break;
        }
        case 'tokenRefresh_failure': {
          console.error('failure while refreshing auth tokens.', payload);

          toast.error('Session expired, Please login again.');
          logout();
          break;
        }
        case 'signInWithRedirect_failure': {
          console.error(
            'failure while trying to resolve signInWithRedirect API.',
            payload
          );
          break;
        }
      }
    });

    fetchUserEmail();

    return () => {
      stopListen();
    };
  }, []);

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
        isImpersonating: auth.friend !== '',
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

function initAmplify(stack: BackendStack = defaultStack) {
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
}

// Amplify Hack to set stack to custom stack. Not sure why, but we are able to set custom stack only after setting default stack.
initAmplify(defaultStack);
initAmplify(appStorage.getItem<AuthState>(StorageKey.AUTH));
