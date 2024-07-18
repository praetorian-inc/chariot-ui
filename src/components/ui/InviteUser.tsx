/* eslint-disable complexity */
import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import { Inputs, Values } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useModifyAccount } from '@/hooks';
import { LinkAccount } from '@/types';
import { cn } from '@/utils/classname';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const InviteUser = (props: Props) => {
  const { open, onClose } = props;
  const { mutate: link } = useModifyAccount('link');
  const [formValue, setFormValue] = useState<Values>({});

  const handleLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    link(formValue as unknown as LinkAccount);
    onClose();
  };

  return (
    <Modal
      title={'Link Account'}
      open={open}
      onClose={onClose}
      className="max-h-[70vh] overflow-y-auto"
      footer={{
        text: 'Connect',
        form: 'integration-modal',
      }}
      size={'lg'}
    >
      <div className={cn('align-start flex pb-10 pt-5')}>
        <div className="align-start flex grow flex-col justify-start">
          <form
            id={'integration-modal'}
            className="space-y-4"
            onSubmit={handleLink}
          >
            <Inputs
              onChange={setFormValue}
              inputs={[
                {
                  label: 'Email Address',
                  value: '',
                  placeholder: 'email@domain.com',
                  name: 'username',
                  required: true,
                  hidden: false,
                },
              ]}
            />
            <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-600">
              <ExclamationTriangleIcon className="inline size-5 text-yellow-700" />
              This will grant them full access to your account.
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
};
