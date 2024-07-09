import { BoltIcon, PauseCircleIcon } from '@heroicons/react/24/solid';

import { Modal } from '@/components/Modal';
import { AssetStatus, AssetStatusLabel } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  status: AssetStatus.ActiveHigh | AssetStatus.Frozen | '';
  onConfirm: () => void;
}

export function AssetStatusWarning({
  open,
  onClose,
  status,
  onConfirm,
}: Props) {
  if (status === AssetStatus.ActiveHigh) {
    return (
      <Modal
        title={`Change Status to ${AssetStatusLabel[AssetStatus.ActiveHigh]}`}
        open={open}
        onClose={onClose}
        style="dialog"
        icon={<BoltIcon className="size-5" />}
        footer={{
          text: 'Change Status',
          className: 'w-fit',
          onClick: onConfirm,
        }}
      >
        <div className="space-y-2 text-sm text-default-light">
          <p>Assets in this status:</p>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              Will be tested more frequently and more intensely in automated
              scans.
            </li>
            <li>
              Included in manual penetration tests by our Managed Services Team
              if manual services have been purchased.
            </li>
          </ul>
        </div>
      </Modal>
    );
  }

  if (AssetStatus.Frozen) {
    return (
      <Modal
        title="Change Status to Freeze"
        open={open}
        onClose={onClose}
        style="dialog"
        icon={<PauseCircleIcon className="size-5" />}
        footer={{
          text: 'Change Status',
          className: 'w-fit',
          startIcon: <PauseCircleIcon className="size-4" />,
          onClick: onConfirm,
        }}
      >
        <div className="text-sm text-default-light">
          <p>Assets in this status will be ignored and no longer tested</p>
        </div>
      </Modal>
    );
  }
}
