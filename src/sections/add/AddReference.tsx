import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useCreateReference } from '@/hooks/useReference';
import { SearchAndSelectTypes } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';

const DEFAULT_FORM_VALUE = {
  class: '',
  name: '',
};

export function AddReference() {
  const {
    modal: {
      reference: { open, onOpenChange, selectedRisks, onSelectedRisksChange },
    },
  } = useGlobalState();
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);

  const { mutateAsync: createRef, status: creatingRef } = useCreateReference();

  function onClose() {
    onOpenChange(false);
  }

  function cleanUp() {
    onSelectedRisksChange([]);
    setFormData(DEFAULT_FORM_VALUE);
  }

  useEffect(() => {
    if (open) {
      return () => {
        cleanUp();
      };
    }
  }, [open]);

  return (
    <Modal title="Add Reference" open={open} onClose={onClose} size="xl">
      <div className="flex flex-row space-y-6 p-6 flex-nowrap">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700">
            What is a Reference?
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            A reference refers to metadata that provides additional information
            about your risks. References help in categorizing and describing
            risks more precisely.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            To add a reference, you will need to provide the class and name
            fields, which describe the type and value of the reference,
            respectively.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            For example, if you work for Acme Corporation, a reference might
            include:
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
              <li>
                Class: <code>Impacted System</code>
              </li>
              <li>
                Name: <code>Payment Processing Server</code>
              </li>
            </ul>
          </p>
        </div>

        <div className="px-10 text-center">
          <div className="relative m-auto ml-4 flex h-[400px] w-full">
            <div className=" w-px bg-gray-200" />
            <div className="absolute -left-[50%] top-[50%] w-full bg-layer0 text-center text-sm text-gray-300" />
          </div>
        </div>
        <form
          className="flex flex-col gap-4 flex-1"
          onSubmit={async event => {
            event.preventDefault();

            const allRef = selectedRisks?.map(async risk => {
              await createRef({
                key: risk.key,
                class: formData.class,
                name: formData.name,
              });
            });

            await Promise.all(allRef);

            onClose();
          }}
        >
          <SearchAndSelectTypes
            type="risks"
            value={selectedRisks}
            onChange={onSelectedRisksChange}
            placeholder="CVE-2017-5487"
          />
          <Inputs
            inputs={[
              {
                label: 'Class',
                value: formData.class,
                placeholder: 'Regulatory Impact',
                name: 'class',
                required: true,
              },
              {
                label: 'Name',
                value: formData.name,
                placeholder: 'GDPR Non-Compliance',
                name: 'name',
                required: true,
              },
            ]}
            onChange={values =>
              setFormData(formData => ({ ...formData, ...values }))
            }
          />
          <Button
            styleType="primary"
            type="submit"
            isLoading={creatingRef === 'pending'}
          >
            Add Reference
          </Button>
        </form>
      </div>
    </Modal>
  );
}
