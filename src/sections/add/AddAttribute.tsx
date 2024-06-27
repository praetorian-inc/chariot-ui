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
      <form
        className="flex flex-col gap-4"
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
        />
        <Inputs
          inputs={[
            {
              label: 'Class',
              value: formData.class,
              placeholder: 'Class',
              name: 'class',
              required: true,
            },
            {
              label: 'Name',
              value: formData.name,
              placeholder: 'Name',
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
    </Modal>
  );
}
