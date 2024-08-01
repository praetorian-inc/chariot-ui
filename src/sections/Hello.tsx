import React from 'react';
import { Navigate } from 'react-router-dom';
import 'aws-amplify/auth/enable-oauth-listener';

import { getRoute } from '@/utils/route.util';

const Hello: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    return null;
  }

  return <Navigate to={getRoute(['app'])} />;
};

export default Hello;
