import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpCircleIcon,
  DocumentArrowDownIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import { OverflowText } from '@/components/OverflowText';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import Spinner from '@/components/Spinner';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { AddRisks } from '@/components/ui/AddRisks';
import { AssetStatusChip } from '@/components/ui/AssetStatusChip';
import Counts from '@/components/ui/Counts';
import { useMy } from '@/hooks';
import { AssetsSnackbarTitle, useUpdateAsset } from '@/hooks/useAssets';
import { useCounts } from '@/hooks/useCounts';
import { useMergeStatus } from '@/utils/api';
import { exportContent } from '@/utils/download.util';
import { getRoute } from '@/utils/route.util';

import { Asset, AssetStatus, Risk, RiskScanMessage } from '../types';

import { useOpenDrawer } from './detailsDrawer/useOpenDrawer';
import { AssetStatusWarning } from './AssetStatusWarning';

type Severity = 'I' | 'L' | 'M' | 'H' | 'C';
type SeverityOpenCounts = Partial<Record<Severity, Risk[]>>;

function buildOpenRiskDataset(
  risks: Risk[]
): Record<string, SeverityOpenCounts> {
  return risks.reduce(
    (acc, risk) => {
      if (!risk.status.startsWith('O')) {
        return acc; // Skip this risk if is not in 'Open' status
      }

      const severity = risk.status[1] as Severity;

      return {
        ...acc,
        [risk.dns]: {
          ...(acc?.[risk?.dns] || {}),
          [severity]: [...(acc[risk.dns]?.[severity] || []), risk],
        },
      };
    },
    {} as Record<string, SeverityOpenCounts>
  );
}

interface AssetsWithRisk extends Asset {
  riskSummary?: SeverityOpenCounts;
}

const Assets: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [showAddRisk, setShowAddRisk] = useState<boolean>(false);

  const { data: stats = {}, status: countsStatus } = useCounts({
    resource: 'asset',
    filterByGlobalSearch: true,
  });
  const {
    isLoading,
    status: assetsStatus,
    data: assets = [],
    refetch,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({
    resource: 'asset',
    filterByGlobalSearch: true,
  });
  const { data: risks = [], status: riskStatus } = useMy({ resource: 'risk' });

  const status = useMergeStatus(riskStatus, assetsStatus, countsStatus);

  const { openAsset } = useOpenDrawer();
  const openRiskDataset = useMemo(
    () => buildOpenRiskDataset(risks as Risk[]),
    [risks]
  );
  const [showAssetStatusWarning, setShowAssetStatusWarning] =
    useState<boolean>(false);
  const [assetStatus, setAssetStatus] = useState<
    AssetStatus.ActiveHigh | AssetStatus.Frozen | ''
  >('');

  const navigate = useNavigate();

  const { mutateAsync: updateAsset } = useUpdateAsset();

  React.useEffect(() => {
    if (!isLoading && assets?.length === 0) {
      const interval = setInterval(() => {
        refetch();
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  // merge risk data with asset data
  const assetsWithRisk: AssetsWithRisk[] = assets.map(asset => {
    const riskSummary = openRiskDataset[asset.dns];

    if (riskSummary) {
      return { ...asset, riskSummary };
    }

    return asset;
  });

  const columns: Columns<AssetsWithRisk> = [
    {
      label: 'Asset Name',
      id: 'name',
      className: 'w-full',
      cell: 'highlight',
      onClick: (item: Asset) => openAsset(item),
      copy: true,
    },
    {
      label: 'DNS',
      id: 'dns',
      className: 'w-full hidden md:table-cell',
      cell: (asset: Asset) => {
        return (
          <CopyToClipboard textToCopy={asset.dns}>
            <OverflowText text={asset.dns} truncateType="center" />
          </CopyToClipboard>
        );
      },
      copy: false,
    },
    {
      label: 'Status',
      id: 'status',
      fixedWidth: 100,
      align: 'center',
      cell: ({ status }: Asset) => (
        <AssetStatusChip status={status} className={'px-2 py-1'} />
      ),
    },
    {
      label: 'First Seen',
      id: 'created',
      cell: 'date',
      className: 'hidden lg:table-cell',
    },
    {
      label: 'Last Seen',
      id: 'updated',
      cell: 'date',
      className: 'hidden lg:table-cell',
    },
    {
      label: 'Protected',
      fixedWidth: 100,
      id: '',
      align: 'center',
      cell: (item: AssetsWithRisk) => {
        const riskSummary = item.riskSummary;

        if (riskSummary && Object.keys(riskSummary)?.length > 0) {
          return (
            <div className="text-center">
              <button
                onClick={() => navigate(getRoute(['app', 'risks']))}
                className={`rounded-[2px] hover:bg-gray-50`}
              >
                <XMarkIcon
                  className={`size-6 stroke-red-600 text-red-600`}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        } else {
          return (
            <CheckIcon
              className={`size-6 [&>path]:stroke-emerald-500 [&>path]:stroke-[1]`}
              aria-hidden="true"
            />
          );
        }
      },
    },
  ];

  function updateStatus(assets: Asset[], status: AssetStatus) {
    const showBulk = showBulkSnackbar(assets.length);
    setShowAssetStatusWarning(false);
    setAssetStatus('');

    assets.forEach(asset => {
      updateAsset(
        {
          key: asset.key,
          name: asset.name,
          status,
          showSnackbar: !showBulk,
        },
        {
          onSuccess: () => {
            if (showBulk) {
              Snackbar({
                title: `${assets.length} assets ${AssetsSnackbarTitle[status]}`,
                description: [
                  AssetStatus.Active,
                  AssetStatus.ActiveHigh,
                ].includes(status)
                  ? RiskScanMessage.Start
                  : RiskScanMessage.Stop,
                variant: 'success',
              });
            }
          },
        }
      );
    });
  }

  const actionItems = useMemo(
    () => [
      {
        label: 'Add Risk',
        icon: <PlusIcon className="size-5" />,
        disabled: (assets: Asset[]) => assets.length === 0,
        onClick: (assets: Asset[]) => {
          {
            setSelectedAssets(assets);
            setShowAddRisk(true);
          }
        },
      },
      {
        label: 'Priority',
        icon: <PlusIcon className="size-5" />,
        disabled: (assets: Asset[]) => assets.length === 0,
        submenu: [
          {
            label: 'High',
            icon: <ArrowUpCircleIcon className="size-5" />,
            disabled: (assets: Asset[]) =>
              assets.every(asset => asset.status === AssetStatus.ActiveHigh),
            onClick: (assets: Asset[]) => {
              setSelectedAssets(assets);
              setShowAssetStatusWarning(true);
              setAssetStatus(AssetStatus.ActiveHigh);
            },
          },
          {
            label: 'Default',
            icon: <PlayIcon className="size-5" />,
            disabled: (assets: Asset[]) =>
              assets.every(asset => isActive(asset)),
            onClick: (assets: Asset[]) =>
              updateStatus(assets, AssetStatus.Active),
          },
          {
            label: 'Freeze',
            icon: <PauseIcon className="size-5" />,
            disabled: (assets: Asset[]) =>
              assets.every(asset => isFrozen(asset)),
            onClick: (assets: Asset[]) => {
              setSelectedAssets(assets);
              setShowAssetStatusWarning(true);
              setAssetStatus(AssetStatus.Frozen);
            },
          },
        ],
      },
      {
        label: 'Unknown',
        icon: <StopIcon className="size-5" />,
        disabled: (assets: Asset[]) => assets.every(asset => isUnknown(asset)),
        onClick: (assets: Asset[]) => updateStatus(assets, AssetStatus.Unknown),
      },
    ],
    []
  );

  return (
    <div className="flex w-full flex-col">
      <Table
        name="assets"
        counters={
          <Counts
            stats={{
              total: Object.keys(stats).reduce((acc, key) => {
                return acc + stats[key];
              }, 0),
              ...stats,
            }}
            type="assets"
          />
        }
        rowActions={{
          items: actionItems.map(item => ({
            ...item,
            disabled: false,
          })),
        }}
        selection={{}}
        actions={{
          items: [
            ...actionItems,
            {
              label: 'Export as JSON',
              onClick: () => exportContent(assets, 'assets'),
              icon: <DocumentArrowDownIcon className="size-5" />,
            },
            {
              label: 'Export as CSV',
              onClick: () => exportContent(assets, 'assets', 'csv'),
              icon: <DocumentArrowDownIcon className="size-5" />,
            },
          ],
        }}
        columns={columns}
        data={assetsWithRisk}
        groupBy={[
          {
            label: 'High Priority',
            filter: asset => asset.status === AssetStatus.ActiveHigh,
          },
          {
            label: 'Standard Priority',
            filter: asset => asset.status !== AssetStatus.ActiveHigh,
          },
        ]}
        error={error}
        status={status}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        noData={{
          icon: <Spinner className="size-[100px]" />,
          title: 'Scans Running',
          description:
            'Your seeds are being scanned and your assets will appear here soon',
        }}
      />
      <AddRisks
        isOpen={showAddRisk}
        onClose={() => {
          setShowAddRisk(false);
        }}
        selectedAssetKeys={selectedAssets.map(asset => asset.key)}
      />
      <AssetStatusWarning
        open={showAssetStatusWarning}
        onClose={() => setShowAssetStatusWarning(false)}
        status={assetStatus}
        onConfirm={() => {
          if (assetStatus) {
            updateStatus(selectedAssets, assetStatus);
          }
        }}
      />
    </div>
  );
};

function isFrozen(asset: Asset) {
  return asset.status === AssetStatus.Frozen;
}

function isUnknown(asset: Asset) {
  return asset.status === AssetStatus.Unknown;
}

function isActive(asset: Asset) {
  return asset.status === AssetStatus.Active;
}

export default Assets;
