import { useEffect, useState } from 'react';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { TabGroup, TabList } from '@headlessui/react';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { TabWrapper } from '@/components/ui/TabWrapper';
import { useCreateAttribute } from '@/hooks/useAttribute';
import { SearchAndSelectTypes } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';
import { capitalize } from '@/utils/lodash.util';

const DEFAULT_FORM_VALUE = {
  class: '',
  name: '',
};

enum AttributeType {
  Asset = 'asset',
  Risk = 'risk',
}

export function AddAttribute() {
  const {
    modal: {
      attribute: {
        open,
        onOpenChange,
        selectedAssets,
        onSelectedAssetsChange,
        selectedRisks,
        onSelectedRisksChange,
      },
    },
  } = useGlobalState();

  const [selectedType, setSelectedType] = useState<AttributeType>(
    AttributeType.Asset
  );

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUE);

  const { mutateAsync: createAttribute, status: creatingAttribute } =
    useCreateAttribute();

  function onClose() {
    onOpenChange(false);
  }

  function cleanUp() {
    onSelectedAssetsChange([]);
    onSelectedRisksChange([]);
    setFormData(DEFAULT_FORM_VALUE);
    setSelectedType(AttributeType.Asset);
  }

  useEffect(() => {
    if (open) {
      return () => {
        cleanUp();
      };
    }
  }, [open]);

  const isAttribute = selectedType === AttributeType.Asset;

  return (
    <Modal
      title="Add Attribute"
      icon={<IdentificationIcon className="size-6 text-default-light" />}
      open={open}
      onClose={onClose}
      size="xl"
    >
      <div className="flex flex-row flex-nowrap p-2">
        <div className="flex flex-1 flex-col space-y-4 p-2">
          <div>
            <h3 className="text-xl font-medium text-gray-700">
              What is an Attribute?
            </h3>
            <p className="text-md mt-1 text-gray-500">
              An attribute refers to metadata that provides additional
              information about your assets or risks. Attributes help in
              categorizing and describing your attack surface more precisely.
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
          className="flex flex-1 flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();

            const allAtt = (isAttribute ? selectedAssets : selectedRisks)?.map(
              asset => {
                return createAttribute({
                  key: asset.key,
                  class: formData.class,
                  name: formData.name,
                });
              }
            );

            await Promise.all(allAtt);

            onClose();
          }}
        >
          <TabGroup>
            <TabList className="flex overflow-x-auto p-1">
              {Object.values(AttributeType).map(tab => (
                <TabWrapper
                  key={tab}
                  value={selectedType}
                  onClick={() => setSelectedType(tab as AttributeType)}
                >
                  {capitalize(tab)}
                </TabWrapper>
              ))}
            </TabList>
          </TabGroup>
          <SearchAndSelectTypes
            types={isAttribute ? ['assets'] : ['risks']}
            value={
              isAttribute
                ? { assets: selectedAssets }
                : { risks: selectedRisks }
            }
            onChange={updatedValue => {
              if (isAttribute) {
                onSelectedAssetsChange(updatedValue.assets || []);
              } else {
                onSelectedRisksChange(updatedValue.risks || []);
              }
            }}
            placeholder={isAttribute ? 'payroll.acme.com' : 'CVE-2017-5487'}
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
