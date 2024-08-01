import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithRedirect } from 'aws-amplify/auth';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Disclaimer } from '@/sections/signup/Disclaimer';
import { PageWrapper } from '@/sections/signup/PageWrapper';
import { getRoute } from '@/utils/route.util';

export const LoginSSO = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');

  const handleSignin = async () => {
    await signInWithRedirect({
      provider: {
        custom: username.split('@')[1],
      },
    });
  };

  return (
    <PageWrapper title="Sign in with SSO">
      <form
        className="flex flex-1 flex-col gap-4 space-y-4 p-2"
        id="signup"
        onSubmit={e => {
          e.preventDefault();
          handleSignin();
        }}
      >
        <Input
          label={'Email Address'}
          value={username}
          placeholder={'janelongestname@praetorian.com'}
          name={'username'}
          required={true}
          onChange={e => {
            setUsername(e.target.value);
          }}
        />
        <Button
          styleType="primary"
          className="w-full"
          type="submit"
          id="signup"
        >
          Continue
        </Button>

        <p className="text-xs">
          {`Login with Email and Password ? `}
          <Button
            onClick={() => navigate(getRoute(['login']))}
            className="text-xs"
            styleType="textPrimary"
          >
            Sign In
          </Button>
        </p>
        <Disclaimer />
      </form>
    </PageWrapper>
  );
};
