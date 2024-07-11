import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { useCreateAttribute } from '@/hooks/useAttribute';
import { Asset } from '@/types';

interface Props {
  asset: Asset;
}

export const AddAttribute = (props: Props) => {
  const { asset } = props;
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });
  const { mutateAsync: createAttribute, status: creatingAttribute } =
    useCreateAttribute();

  function reset() {
    setFormData({
      name: '',
      value: '',
    });
    setOpen(false);
  }

  function handleSubmit() {
    createAttribute(
      {
        key: asset.key,
        class: formData.name,
        name: formData.value,
      },
      {
        onSuccess: reset,
      }
    );
  }

  return (
    <Accordian
      title="Add Attribute"
      defaultOpen={false}
      open={open}
      onOpenChange={setOpen}
    >
      <form
        className="flex flex-1 flex-col gap-4"
        onSubmit={event => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Inputs
          inputs={[
            {
              label: 'Attribute Name',
              value: formData.name,
              placeholder: 'technology',
              name: 'name',
              required: true,
            },
            {
              label: 'Attribute Value',
              value: formData.value,
              placeholder: 'Apache Web Server',
              name: 'value',
              required: true,
            },
          ]}
          onChange={values =>
            setFormData(formData => ({ ...formData, ...values }))
          }
        />
        <div className="flex gap-2">
          <Button
            styleType="primary"
            type="submit"
            className="w-fit"
            startIcon={<PlusIcon className="size-4" />}
            disabled={creatingAttribute === 'pending'}
          >
            Add Attribute
          </Button>
          <Button
            styleType="textPrimary"
            className="w-fit"
            disabled={creatingAttribute === 'pending'}
            onClick={reset}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Accordian>
  );
};
