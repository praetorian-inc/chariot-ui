import { LogoIcon } from '@/components/icons/Logo.icon';

const Footer = () => {
  return (
    <div className="w-full">
      <div className="m-auto w-full max-w-screen-xl">
        <footer className="mt-12 flex w-full items-center justify-between gap-2 p-4 text-xs text-gray-400">
          <div className="w-1/3">
            Copyright &copy; {new Date().getFullYear()}. All Rights Reserved.
          </div>
          <div className="center flex w-1/3 items-center justify-center">
            <LogoIcon className="mr-1 size-9" />
            <span className="text-lg font-bold leading-8">praetorian</span>
          </div>
          <div className="flex w-1/3 space-x-4 font-semibold">
            <a
              href="https://www.praetorian.com/terms-of-service/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Terms of Service
            </a>
            <div className="h-4 border-r border-gray-300" />
            <a
              href="https://github.com/praetorian-inc/chariot-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Source Code
            </a>
            <div className="h-4 border-r border-gray-300" />
            <a
              href="https://github.com/praetorian-inc/praetorian-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Command Line
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
