import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmSignUp,
  fetchAuthSession,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { toast } from 'sonner';

import { queryClient } from '@/queryclient';
import { AuthContextType, AuthState, BackendType } from '@/types';
import { initAmplify } from '@/utils/amplify.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

export const REGION_REGEX = /.*execute-api.(.*).amazonaws/;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const emptyAuth: AuthState = {
  token: '',
  backend: 'chariot',
  api: 'https://d0qcl2e18h.execute-api.us-east-2.amazonaws.com/chariot',
  region: 'us-east-2',
  clientId: '795dnnr45so7m17cppta0b295o',
  me: '',
  friend: { email: '', displayName: '' },
  isImpersonating: false,
  userPoolId: 'us-east-2_BJ6QHVG2L',
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [auth, setAuth] = useStorage<AuthState>(
    { key: StorageKey.AUTH },
    emptyAuth
  );

  const [isLoading, setIsLoading] = useState(false);
  const { expiry } = auth;

  const [, setIsTabVisible] = useState(true);
  const [, setNewUserSeedModal] = useStorage(
    { key: StorageKey.SHOW_NEW_USER_SEED_MODAL },
    false
  );

  const [isTokenRefreshing, setIsTokenRefreshing] = useState(isExpired(expiry));

  const updateTabVisibility = useCallback(() => {
    const isVisible = document.visibilityState === 'visible';

    if (isVisible) {
      fetchToken();
    }

    setIsTabVisible(isVisible);
  }, [expiry]);

  const startImpersonation = (memberId: string, displayName: string) => {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: { email: memberId, displayName: displayName },
      };
    });
    window.location.assign('/app/overview');
  };

  const stopImpersonation = () => {
    setAuth(prevAuth => {
      return {
        ...prevAuth,
        friend: { email: '', displayName: '' },
      };
    });
    window.location.assign('/app/account');
  };

  // This function is mainly to handle cases where the user is using their own stack
  const setBackendStack = (backendStack?: BackendType) => {
    const api = backendStack?.api || emptyAuth.api;
    const backend = backendStack?.name || emptyAuth.backend;
    const clientId = backendStack?.client_id || emptyAuth.clientId;
    const userPoolId = backendStack?.userPoolId || emptyAuth.userPoolId;
    const region = REGION_REGEX.exec(api)?.[1] ?? 'us-east-2';

    initAmplify({
      clientId,
      userPoolId,
      backend,
      region,
      api,
    });

    setAuth(prevAuth => ({
      ...prevAuth,
      backend,
      clientId,
      api,
      userPoolId,
    }));
  };

  const login = async (username = '', password = '') => {
    try {
      if (username && password) {
        setNewUserSeedModal(true);
        setIsLoading(true);
        const { isSignedIn } = await signIn({
          username,
          password,
        });
        fetchToken();
        if (isSignedIn) {
          navigate('/');
        }
      }
    } catch (error) {
      error instanceof Error && error.message && setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  async function signup(username = '', password = '', gotoNext = () => {}) {
    try {
      setIsLoading(true);
      if (emptyAuth.backend !== auth.backend) {
        setBackendStack({
          name: auth.backend,
          client_id: auth.clientId,
          api: auth.api,
          userPoolId: auth.userPoolId,
        });
      }
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

  async function fetchToken() {
    setIsTokenRefreshing(true);
    const session = await fetchAuthSession();
    setAuth(auth => ({
      ...auth,
      token: session.tokens?.idToken?.toString() ?? '',
      me: session.tokens?.idToken?.payload?.email?.toString() ?? '',
    }));
    setIsTokenRefreshing(false);
  }

  async function logout() {
    queryClient.clear();
    setAuth(emptyAuth);
    setNewUserSeedModal(false);

    await signOut();
    navigate(getRoute(['login']));
    setBackendStack();
  }

  const value: AuthContextType = useMemo(
    (): AuthContextType => ({
      ...auth,
      confirmOTP,
      error,
      fetchToken,
      isImpersonating: auth.friend.email !== '',
      isLoading,
      login,
      logout,
      setAuth,
      setBackendStack,
      setError,
      signup,
      startImpersonation,
      stopImpersonation,
    }),
    [login, logout, JSON.stringify(auth)]
  );

  useEffect(() => {
    document.addEventListener('visibilitychange', updateTabVisibility);

    return () => {
      document.removeEventListener('visibilitychange', updateTabVisibility);
    };
  }, [updateTabVisibility]);

  if (isTokenRefreshing) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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

function getCurrentData() {
  return new Date();
}

function isExpired(expiry?: Date) {
  if (!expiry) return false;

  const expiryDate = new Date(expiry);
  const currentDate = getCurrentData();

  return currentDate > expiryDate;
}
