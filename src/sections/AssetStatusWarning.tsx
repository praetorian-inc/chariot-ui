import {
  ArchiveBoxIcon,
  BoltIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/solid';

import { Modal } from '@/components/Modal';
import { AssetStatus, AssetStatusLabel } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  status: AssetStatus | '';
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
  } else if (status === AssetStatus.Frozen) {
    return (
      <Modal
        title="Change Status to Excluded"
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
          <p>
            Assets in this status will be paused or excluded from scanning but
            remain in the system for future reference.
          </p>
        </div>
      </Modal>
    );
  } else if (status === AssetStatus.Deleted) {
    return (
      <Modal
        title="Change Status to Deleted"
        open={open}
        onClose={onClose}
        style="dialog"
        icon={<ArchiveBoxIcon className="size-5" />}
        footer={{
          text: 'Change Status',
          className: 'w-fit',
          startIcon: <ArchiveBoxIcon className="size-4" />,
          onClick: onConfirm,
        }}
      >
        <div className="text-sm text-default-light">
          <p>
            Assets in this status will be excluded from future scans and
            retained in the system for historical records.
          </p>
          <p className="mt-2 italic">No data will be permanently removed.</p>
        </div>
      </Modal>
    );
  }
}
