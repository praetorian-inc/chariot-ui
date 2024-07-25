import { Modal } from '@/components/Modal';
import { useUpgrade } from '@/hooks/useUpgrade';
import { useGlobalState } from '@/state/global.state';

export const UpgradeModal = () => {
  const {
    modal: { upgrade: upgradeState },
  } = useGlobalState();

  const { mutate: upgrade } = useUpgrade();

  return (
    <Modal
      title={'Free Upgrade'}
      size="lg"
      open={upgradeState.open}
      onClose={() => upgradeState.onOpenChange(false)}
      footer={{
        className: 'w-32',
        text: 'Free Upgrade',
        onClick: () => {
          upgrade();
          upgradeState.onOpenChange(false);
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

        <div className="mt-6 flex justify-around space-x-2">
          <div className="flex h-60 w-1/3 flex-col items-center rounded-sm bg-gray-50 p-6">
            <p className="h-1/4 text-lg  font-bold">Free Tier</p>
            <p className="h-1/2 text-center text-gray-700">
              Enter one domain for asset and risk discovery
            </p>
            <button
              className="mt-4 h-1/4 cursor-not-allowed rounded-sm bg-gray-200 px-4 py-2 text-gray-600"
              disabled
            >
              Current Plan
            </button>
          </div>

          <div className="flex h-60 w-1/3 flex-col items-center rounded-sm bg-gray-50 p-6">
            <p className="h-1/4 text-lg font-bold">Unmanaged</p>
            <p className="h-1/2 text-center text-gray-700">
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
              className="mt-4 h-1/4 rounded-sm border border-brand-light px-4 py-2 text-brand"
            >
              Contact Us
            </button>
          </div>

          <div className="flex h-60 w-1/3 flex-col items-center rounded-sm border border-brand bg-gray-50 p-6">
            <p className="h-1/4 text-lg font-bold">Managed</p>
            <p className="h-1/2 text-center text-gray-700">
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
              className="mt-4 h-1/4 rounded-sm border border-brand-light px-4 py-2 text-brand"
            >
              Contact Us
            </button>
          </div>
        </div>
        <p className="text-md mt-12 text-center text-gray-600">
          Our team will contact you within 24 hours to start your managed
          service trial.
        </p>
      </div>
    </Modal>
  );
};
