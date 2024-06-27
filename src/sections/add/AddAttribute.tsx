import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useCreateAttribute } from '@/hooks/useAttribute';
import { SearchAndSelectTypes } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';

const DEFAULT_FORM_VALUE = {
  class: '',
  name: '',
};
export function AddAttribute() {
  const {
    modal: {
      attribute: { open, onOpenChange, selectedAssets, onSelectedAssetsChange },
    },
  } = useGlobalState();

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);

  const { mutateAsync: createAttribute, status: creatingAttribute } =
    useCreateAttribute();

  function onClose() {
    onOpenChange(false);
  }

  function cleanUp() {
    onSelectedAssetsChange([]);
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
    <Modal title="Add Attribute" open={open} onClose={onClose} size="xl">
      <div className="flex flex-row space-y-6 p-6 flex-nowrap">
        <div className="flex-1">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              What is an Attribute?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              An attribute refers to metadata that provides additional
              information about your assets. Attributes help in categorizing and
              describing assets more precisely.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              To add an attribute, you will need to provide the class and name
              fields, which describe the type and value of the attribute,
              respectively.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              For example, if you work for Acme Corporation, an attribute might
              include:
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
                <li>
                  Class: <code>Operating System</code>
                </li>
                <li>
                  Name: <code>Windows Server 2019</code>
                </li>
              </ul>
            </p>
          </div>
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

            const allAtt = selectedAssets?.map(asset => {
              return createAttribute({
                key: asset.key,
                class: formData.class,
                name: formData.name,
              });
            });

            await Promise.all(allAtt);

            onClose();
          }}
        >
          <SearchAndSelectTypes
            type="assets"
            value={selectedAssets}
            onChange={onSelectedAssetsChange}
            placeholder="8.8.8.8"
          />
          <Inputs
            inputs={[
              {
                label: 'Class',
                value: formData.class,
                placeholder: 'Business Unit',
                name: 'class',
                required: true,
              },
              {
                label: 'Name',
                value: formData.name,
                placeholder: 'Finance Department',
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
            isLoading={creatingAttribute === 'pending'}
          >
            Add Attribute
          </Button>
        </form>
      </div>
    </Modal>
  );
}
