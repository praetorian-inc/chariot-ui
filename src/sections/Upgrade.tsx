import { useState } from 'react';

import { Modal } from '@/components/Modal';
import { useUpgrade } from '@/hooks/useUpgrade';

export function Upgrade() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="absolute bottom-16 right-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 w-[150px] animate-ping rounded-full bg-indigo-500 opacity-25 blur-md"></div>
          <button
            className="relative z-10 flex items-center justify-center space-x-2 rounded-full border border-indigo-500 bg-indigo-600 px-4 py-2 text-white shadow-lg transition-transform hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            onClick={() => setIsOpen(true)}
          >
            <span className=" px-2 py-1 text-lg font-medium">Upgrade Now</span>
            <svg
              width="40"
              height="40"
              viewBox={`0 0 74 74`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M37.0306 0C56.3771 0 72.0612 15.6872 72.0612 35.0306C72.0612 47.071 65.9842 57.693 56.7333 64C48.3901 58.9979 41.831 51.1874 40.6585 42.5101C36.8982 41.782 32.3594 41.5551 29.0373 42.5511L25.857 32.4113L30.7173 40.2565C33.4626 39.7427 36.5452 39.7364 39.7728 40.2407C38.2977 39.1722 37.371 39.0052 35.1709 38.2991C43.8041 38.2203 52.2418 46.3397 53.7642 53.7152L60.6575 53.2015L65.3948 44.9308C57.9342 37.1739 52.5349 29.1018 51.9581 21.1306L37.475 10.8174C36.7406 12.2799 36.52 13.8307 36.5704 15.4224C34.6131 12.8725 36.4727 9.39591 38.9091 4.79409C39.2937 4.03763 39.549 3.56799 37.8438 4.12273C33.1064 5.66718 29.5006 8.46609 27.392 11.5329C12.4297 18.1079 5.22128 28.1594 2.94558 37.7633L2.52322 41.0917C2.17966 39.1249 2 37.1014 2 35.0369C2 15.6872 17.684 0 37.0306 0ZM38.7925 10.975L42.2565 13.5218C42.7419 12.3997 44.0468 10.7828 45.9884 9.54405C46.6881 9.16267 46.9434 8.69934 45.2886 8.85378C42.9247 9.07126 40.2014 10.4045 38.7925 10.975ZM61.5369 48.1962L59.9483 43.3359L57.9752 43.9001L58.2179 46.3145C59.4188 44.8898 59.9231 46.6927 61.5369 48.1962ZM38.118 21.8208C41.0808 23.381 40.8665 23.8255 41.0966 26.7505L44.135 28.7173L45.919 29.1396L47.7787 31.1348C45.2697 27.1066 43.5015 23.1573 38.118 21.8208Z"
                fill={'white'}
              />
            </svg>
          </button>
        </div>
      </div>
      <UpgradeModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

interface UpgradeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const UpgradeModal = ({ isOpen, setIsOpen }: UpgradeModalProps) => {
  const { mutate: upgrade } = useUpgrade();

  return (
    <Modal
      title={'Free Upgrade'}
      size="lg"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      footer={{
        className: 'w-32',
        text: 'Free Upgrade',
        onClick: () => {
          upgrade();
          setIsOpen(false);
        },
      }}
    >
      <div className="flex flex-col p-2 text-gray-800">
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold">Free Managed-Service Trial</p>
          <p className="text-xl text-gray-700">
            Enjoy a 7-day free trial of our managed-service plan.
          </p>
        </div>

        <div className="flex justify-around mt-6 space-x-2">
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-sm w-1/3 h-60">
            <p className="text-lg font-bold  h-1/4">Free Tier</p>
            <p className="text-gray-700 text-center h-1/2">
              Enter one domain for asset and risk discovery
            </p>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-600 rounded-sm cursor-not-allowed h-1/4"
              disabled
            >
              Current Plan
            </button>
          </div>

          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-sm w-1/3 h-60">
            <p className="text-lg font-bold  h-1/4">Self-Service</p>
            <p className="text-gray-700 text-center h-1/2">
              Enter unlimited domains for asset and risk discovery
            </p>
            <button
              onClick={e => {
                e.preventDefault();
                window.open(
                  'https://www.praetorian.com/contact-us',
                  '_blank',
                  'noopener noreferrer'
                );
              }}
              className="mt-4 px-4 py-2 border border-brand-light h-1/4 text-brand rounded-sm"
            >
              Contact Us
            </button>
          </div>

          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-sm w-1/3 h-60 border border-brand">
            <p className="text-lg font-bold h-1/4">Managed-Service</p>
            <p className="text-gray-700 text-center h-1/2">
              Unlimited domains + expert risk assessment
            </p>
            <button
              onClick={e => {
                e.preventDefault();
                window.open(
                  'https://www.praetorian.com/contact-us',
                  '_blank',
                  'noopener noreferrer'
                );
              }}
              className="mt-4 px-4 py-2 border border-brand-light h-1/4 text-brand rounded-sm"
            >
              Contact Us
            </button>
          </div>
        </div>
        <p className="text-md text-gray-600 text-right mt-12">
          We will contact you to confirm before starting your trial.
        </p>
      </div>
    </Modal>
  );
};
