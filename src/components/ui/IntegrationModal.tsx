/* eslint-disable complexity */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { getFormValues, Inputs, Values } from '@/components/form/Inputs';
import { Modal } from '@/components/Modal';
import { useModifyAccount } from '@/hooks';
import { Account, AccountMetadata, LinkAccount } from '@/types';
import { IntegrationMeta } from '@/utils/availableIntegrations';
import { cn } from '@/utils/classname';
import { getRoute } from '@/utils/route.util';

interface Props {
  form?: IntegrationMeta & { connectedAccounts?: Account[] };
  onClose: () => void;
  updateForm?: boolean;
}

export const IntegrationModal = (props: Props) => {
  const { form, updateForm, onClose } = props;
  const connectedAccounts = form?.connectedAccounts || [];
  const { mutate: link } = useModifyAccount('link');
  const [formValues, setFormValues] = useState<Values[]>([]);
  const hasDescription = form?.description || form?.message || form?.logo;
  const showInputs =
    form?.inputs?.some(input => !input.hidden) && formValues.length > 0;
  const navigate = useNavigate();

  useEffect(() => {
    const formValues =
      connectedAccounts?.length > 0
        ? connectedAccounts.map(account => {
            return {
              key: account.key,
              ...form?.inputs?.reduce((acc, input) => {
                return {
                  ...acc,
                  [input.name]:
                    input.name === 'value'
                      ? account?.value
                      : (account?.config as Record<string, AccountMetadata>)?.[
                          input.name
                        ] || input.value.toString(),
                };
              }, {}),
            };
          })
        : [getFormValues(form?.inputs || [])];
    setFormValues(formValues);
  }, [JSON.stringify(form?.inputs), JSON.stringify(connectedAccounts)]);

  function handleClose() {
    onClose();
  }

  const handleLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formValues) {
      formValues.map(formValue => link(formValue as unknown as LinkAccount));
      handleClose();
    }
  };

  return (
    <Modal
      title={form?.displayName || ''}
      open={Boolean(form)}
      onClose={handleClose}
      className="max-h-[70vh] overflow-y-auto"
      footer={{
        left:
          connectedAccounts?.length > 0 && form && form.name !== 'hook' ? (
            <Button
              onClick={() => {
                navigate({
                  pathname: getRoute(['app', 'jobs']),
                  search: `?hashSearch=${encodeURIComponent(`#${form.name}`)}`,
                });
              }}
            >
              Recent Activity
            </Button>
          ) : undefined,
        text: updateForm ? 'Update' : 'Connect',
        form: 'integration-modal',
      }}
      size={'lg'}
    >
      <div
        className={cn(
          'align-start flex pb-10 pt-5',
          (showInputs || form?.markup) && 'gap-10'
        )}
      >
        {hasDescription && (
          <div
            className={cn(
              'space-y-6 font-medium w-full',
              (showInputs || form?.markup) && 'w-52'
            )}
          >
            {form?.logo && (
              <img
                className="h-10"
                src={form?.logo || ''}
                alt={form?.displayName || ''}
              />
            )}
            {form?.description && (
              <div className="text-sm">{form.description}</div>
            )}
            {form?.message && <div>{form.message}</div>}
          </div>
        )}

        <div className="align-start flex grow flex-col justify-start">
          <form
            id={'integration-modal'}
            className="space-y-4"
            onSubmit={handleLink}
          >
            <div className={cn('space-y-4', hasDescription && 'cx-5')}>
              {form?.markup && (
                <div className="relative space-y-2 rounded border-2 border-default bg-layer1 px-5 py-6">
                  {form.markup}
                </div>
              )}
              {showInputs &&
                formValues.map((formValue, index) => {
                  return (
                    <div
                      key={index}
                      className="relative space-y-2 rounded border-2 border-default bg-layer1 px-5 py-6"
                    >
                      {index !== 0 && (
                        <Button
                          aria-label="CloseIcon"
                          className="absolute right-0 top-0"
                          onClick={() => {
                            setFormValues(values =>
                              values.filter((_, i) => {
                                return i !== index;
                              })
                            );
                          }}
                          styleType="none"
                        >
                          <XMarkIcon className="size-4" />
                        </Button>
                      )}
                      <Inputs
                        inputs={(form?.inputs || []).map(input => ({
                          ...input,
                          value: formValue[input.name] || input.value,
                        }))}
                        onChange={newValues =>
                          setFormValues(values => {
                            if (!values) {
                              return [newValues];
                            }
                            if (values.length < index || !values[index]) {
                              return [...values, newValues];
                            }

                            return values?.map((value, i) =>
                              i === index ? newValues : value
                            );
                          })
                        }
                      />
                    </div>
                  );
                })}
            </div>
            {form?.multiple && (
              <Button
                styleType="textPrimary"
                className="!mt-0"
                endIcon={<ChevronRightIcon className="size-5" />}
                onClick={() =>
                  setFormValues(values => [
                    ...(values || []),
                    getFormValues(form?.inputs || []),
                  ])
                }
              >
                Add Another
              </Button>
            )}
            {form?.warning && (
              <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-600">
                <ExclamationTriangleIcon className="inline size-5 text-yellow-700" />
                {form?.warning}
              </p>
            )}
          </form>
        </div>
      </div>
    </Modal>
  );
};
