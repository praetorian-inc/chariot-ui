import React from 'react';

import { LogoIcon } from '@/components/icons/Logo.icon';

const Footer = () => {
  return (
    <div className="w-full">
      <div className="m-auto w-full max-w-screen-xl">
        <footer className="mt-12 flex w-full items-center justify-between gap-2 border-t border-default p-4 text-xs text-gray-400">
          <div>
            Copyright &copy; {new Date().getFullYear()}. All Rights Reserved.
          </div>
          <div className="flex items-center">
            <LogoIcon className="mr-1 size-9" />
            <span className="text-lg font-bold leading-8">praetorian</span>
          </div>
          <div className="flex space-x-4 font-semibold">
            <a
              href="https://github.com/praetorian-inc/chariot-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Chariot UI
            </a>
            <a
              href="https://github.com/praetorian-inc/praetorian-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Praetorian CLI
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
