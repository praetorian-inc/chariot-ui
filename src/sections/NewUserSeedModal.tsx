import { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Radio, RadioGroup } from '@headlessui/react';

import { Button } from '@/components/Button';
import { ModalWrapper } from '@/components/Modal';
import { useMy } from '@/hooks';
import { useCreateAsset } from '@/hooks/useAssets';
import { AssetStatus } from '@/types';
import { AllowedSeedRegex } from '@/utils/regex.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

const options = [
  {
    label: 'Discover assets',
    value: AssetStatus.ActiveLow,
  },
  {
    label: 'Discover assets and scan for risks',
    value: AssetStatus.Active,
  },
];

export const NewUserSeedModal = () => {
  const { data: assets = [], status } = useMy({
    resource: 'asset',
  });

  const [open, setOpen] = useState(false);
  const [seedInput, setSeedInput] = useState<string>('');
  const [assetStatus, setAssetStatus] = useState<AssetStatus>(options[0].value);

  const { mutate: createAsset } = useCreateAsset();
  const [newUserSeedModal, setNewUserSeedModal] = useStorage(
    { key: StorageKey.SHOW_NEW_USER_SEED_MODAL },
    false
  );

  useEffect(() => {
    if (status === 'success' && assets.length === 0 && newUserSeedModal) {
      setOpen(true);
    }
  }, [assets, status, newUserSeedModal]);

  function handleClose() {
    setNewUserSeedModal(false);
    setOpen(false);
  }

  const handleSubmitSeed = () => {
    if (seedInput.match(AllowedSeedRegex)) {
      try {
        const asset = seedInput;
        createAsset({ name: asset, status: assetStatus });
      } catch (error) {
        console.error(error);
      } finally {
        setSeedInput('');
        handleClose();
      }
    }
  };

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      size="xl"
      className="border-none"
    >
      <div className="bg-header">
        <Button
          className="ml-auto text-default-light"
          styleType={'none'}
          onClick={handleClose}
        >
          Skip for Now
        </Button>
        <div className="px-20 pb-16 pt-10 text-center">
          <div className="mb-4 text-3xl font-extrabold text-header">
            We Find Risks in Your Assets
          </div>
          <p className="text-sm text-default-light">
            Enter your domain and our intelligent algorithms will map your
            attack surface.
          </p>
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSubmitSeed();
            }}
          >
            <div className="relative mt-6 w-full">
              <input
                required
                type="text"
                placeholder="domain.com"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                className="block h-16 w-full rounded-l-[2px] bg-layer0 px-3 py-2 pr-[400px] text-xl font-bold shadow-sm focus:outline-none"
              />
              <RadioGroup
                value={assetStatus}
                onChange={setAssetStatus}
                aria-label="Server size"
                className="mt-8 flex items-center justify-center gap-8"
              >
                {options.map(plan => (
                  <Radio
                    key={plan.value}
                    value={plan.value}
                    className="group relative flex w-[350px] cursor-pointer rounded-lg bg-white/5 px-5 py-4 text-white shadow-md transition focus:outline-none data-[checked]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm/6">
                        <p className="font-semibold text-white">{plan.label}</p>
                      </div>
                      <CheckCircleIcon className="ml-4 size-6 fill-white opacity-0 transition group-data-[checked]:opacity-100" />
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </div>
            <Button
              styleType="primary"
              type="submit"
              className="m-auto mt-6 w-3/4 rounded-full"
            >
              Scan Now
            </Button>
          </form>
        </div>
      </div>
    </ModalWrapper>
  );
};
