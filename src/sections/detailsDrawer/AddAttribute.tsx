import { useState } from 'react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Popover } from '@/components/Popover';
import { useCreateAttribute } from '@/hooks/useAttribute';

interface Props {
  resourceKey: string;
}

export const AddAttribute = (props: Props) => {
  const { resourceKey } = props;
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

  return (
    <Popover
      onClick={() => setOpen(!open)}
      type="button"
      open={open}
      setOpen={setOpen}
      styleType="none"
      className="m-2 rounded-sm border border-gray-200 px-6 text-sm hover:bg-gray-100"
      endIcon={<ChevronDownIcon className="size-4" />}
      label="Add Attribute"
      style={{ zIndex: 1 }}
    >
      <div className="w-[300px]">
        <form
          className="flex flex-1 flex-col gap-4 space-y-4 p-2"
          onSubmit={event => {
            event.preventDefault();
            createAttribute(
              {
                key: resourceKey,
                class: formData.name,
                name: formData.value,
              },
              {
                onSuccess: reset,
              }
            );
          }}
        >
          <Inputs
            inputs={[
              {
                label: 'Name',
                value: formData.name,
                placeholder: 'technology',
                name: 'name',
                required: true,
              },
              {
                label: 'Value',
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
              Add
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
      </div>
    </Popover>
  );
};
