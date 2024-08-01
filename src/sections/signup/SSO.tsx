import { useEffect } from 'react';
import { signInWithRedirect } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { toast } from 'sonner';

import { Button } from '@/components/Button';

export const SSO = () => {
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect_failure') {
        toast.error('An error has occurred during the OAuth flow.');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <div className="relative text-center">
        <hr className="absolute top-2.5 w-full border-t-2 border-default" />
        <span className="relative bg-layer0 px-8 text-center font-semibold">
          OR
        </span>
      </div>
      <Button
        className="w-full"
        styleType="secondary"
        onClick={() => signInWithRedirect({ provider: 'Google' })}
      >
        <img
          src="/icons/GoogleSSO.svg"
          alt="Google SSO"
          className="mr-2 size-5"
        />
        <span>Sign in with Google</span>
      </Button>
    </>
  );
};
