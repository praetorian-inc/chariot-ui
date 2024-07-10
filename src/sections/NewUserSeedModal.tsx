import { useEffect, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { ModalWrapper } from '@/components/Modal';
import { useMy } from '@/hooks';
import { useCreateAsset } from '@/hooks/useAssets';
import { AssetStatus, AssetStatusLabel } from '@/types';
import { AllowedSeedRegex } from '@/utils/regex.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

export const NewUserSeedModal = () => {
  const { data: assets = [], status } = useMy({
    resource: 'asset',
  });

  const [open, setOpen] = useState(false);
  const [seedInput, setSeedInput] = useState<string>('');
  const [intensity, setIntensity] = useState<AssetStatus>(AssetStatus.Active);
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
        createAsset({ name: asset, status: intensity });
      } catch (error) {
        console.error(error);
      } finally {
        setSeedInput('');
        handleClose();
      }
    }
  };

  const intensityActions = {
    menu: {
      items: [
        {
          label: AssetStatusLabel[AssetStatus.ActiveHigh],
          icon: getAssetStatusIcon(AssetStatus.ActiveHigh),
          onClick: () => setIntensity(AssetStatus.ActiveHigh),
        },
        {
          label: AssetStatusLabel[AssetStatus.Active],
          icon: getAssetStatusIcon(AssetStatus.Active),
          onClick: () => setIntensity(AssetStatus.Active),
        },
        {
          label: AssetStatusLabel[AssetStatus.ActiveLow],
          icon: getAssetStatusIcon(AssetStatus.ActiveLow),
          onClick: () => setIntensity(AssetStatus.ActiveLow),
        },
      ],
    },
  };

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      size="lg"
      className="border-none"
    >
      <div className="bg-header">
        <Button
          aria-label="CloseIcon"
          className="ml-auto text-default-light"
          onClick={handleClose}
          styleType="none"
        >
          <XMarkIcon className="size-6" />
        </Button>
        <div className="px-20 pb-16 pt-10 text-center">
          <div className="mb-4 text-3xl font-extrabold text-header">
            We Find Risks in Your Assets
          </div>
          <p className="text-sm text-default-light">
            Enter your domain and our intelligent algorithms will map your
            attack surface.
          </p>
          <div className="mt-4 flex w-full flex-col items-start">
            <Dropdown
              disabled={false}
              className="w-full bg-header-dark disabled:cursor-not-allowed disabled:bg-header-dark"
              styleType="header"
              endIcon={<ChevronDownIcon className="size-3 stroke-[4px]" />}
              {...intensityActions}
            >
              {AssetStatusLabel[intensity]}
            </Dropdown>
          </div>
          <form
            className="flex flex-col items-center py-1 pb-6"
            onSubmit={event => {
              event.preventDefault();
              handleSubmitSeed();
            }}
          >
            <div className="flex w-full flex-row items-center">
              <input
                required
                type="text"
                placeholder="domain.com"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                className="block h-16 w-full rounded-l-[2px] bg-layer0 px-3 py-2 text-xl font-bold shadow-sm focus:outline-none"
              />
              <Button
                styleType="primary"
                type="submit"
                disabled={!seedInput}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                className="hover:bg-brand-hover text-md block h-16 w-[150px] items-center rounded-r-[2px] border border-none border-brand bg-brand  px-6 py-2.5 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:bg-brand-light disabled:text-white"
              >
                Scan Now
              </Button>
            </div>
          </form>
          <Button
            className="m-auto text-default-light"
            styleType={'none'}
            endIcon={<ChevronRightIcon className="size-5" />}
            onClick={handleClose}
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
