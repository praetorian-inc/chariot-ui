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
      <form
        className="flex flex-col gap-4"
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
              placeholder: 'URL',
              name: 'class',
              required: true,
            },
            {
              label: 'Name',
              value: formData.name,
              placeholder: 'https://acme.com:443/wp-json/wp/v2/users/',
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
    </Modal>
  );
}
