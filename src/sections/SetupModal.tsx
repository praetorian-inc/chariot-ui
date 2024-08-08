import { Fragment } from 'react/jsx-runtime';
import { Dialog, Transition } from '@headlessui/react';

import { Button } from '@/components/Button';
import { Inputs, Values } from '@/components/form/Inputs';
import { Integrations } from '@/sections/overview/Module';

const SetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedIntegration: string | null;
}> = ({ isOpen, onClose, selectedIntegration }) => {
  const integration =
    Integrations[selectedIntegration as keyof typeof Integrations];

  if (!integration) return null;

  const handleInputsChange = (values: Values) => {
    console.log('Input Values:', values);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {integration.name} Setup
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  {integration.markup ? (
                    integration.markup
                  ) : (
                    <Inputs
                      inputs={integration.inputs || []}
                      onChange={handleInputsChange}
                    />
                  )}
                </div>
                <div className="mt-4 flex flex-row justify-end space-x-1">
                  <Button
                    styleType="none"
                    onClick={onClose}
                    className="text-gray-600"
                  >
                    Setup Later
                  </Button>
                  <Button styleType="primary" onClick={onClose}>
                    Finish
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SetupModal;
