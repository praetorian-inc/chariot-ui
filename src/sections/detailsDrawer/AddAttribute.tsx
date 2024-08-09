import { useState } from 'react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Inputs } from '@/components/form/Inputs';
import { Popover } from '@/components/Popover';
import { useCreateAttribute } from '@/hooks/useAttribute';

interface Props {
  resourceKey: string;
  className?: string; // Optional prop for custom class names
}

export const AddAttribute = (props: Props) => {
  const { resourceKey, className } = props;
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });
  const { mutateAsync: createAttribute, status: creatingAttribute } =
    useCreateAttribute(resourceKey);

  function reset() {
    setFormData({
      name: '',
      value: '',
    });
    setOpen(false);
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Popover
        onClick={() => setOpen(!open)}
        type="button"
        open={open}
        setOpen={setOpen}
        styleType="none"
        className="relative flex items-center text-nowrap rounded-md bg-white py-5"
        endIcon={<ChevronDownIcon className="ml-auto size-3 text-default" />}
        startIcon={<PlusIcon className="size-5 text-default" />}
        label="Add Attribute"
        style={{ zIndex: 1 }}
      >
        <div className="w-[360px]">
          <form
            className="space-y-4 px-4"
            onSubmit={event => {
              event.preventDefault();
              createAttribute(
                {
                  key: resourceKey,
                  name: formData.name,
                  value: formData.value,
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
            <div className="flex justify-start gap-2">
              <Button
                styleType="primary"
                type="submit"
                disabled={creatingAttribute === 'pending'}
              >
                Add Attribute
              </Button>
              <Button
                styleType="secondary"
                disabled={creatingAttribute === 'pending'}
                onClick={reset}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Popover>
    </div>
  );
};
