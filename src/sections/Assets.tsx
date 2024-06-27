import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PauseIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Dropdown } from '@/components/Dropdown';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { SpinnerIcon } from '@/components/icons/Spinner.icon';
import { Link } from '@/components/Link';
import { OverflowText } from '@/components/OverflowText';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { AssetStatusChip } from '@/components/ui/AssetStatusChip';
import { useMy } from '@/hooks';
import { AssetsSnackbarTitle, useUpdateAsset } from '@/hooks/useAssets';
import { useCounts } from '@/hooks/useCounts';
import { AssetStatusWarning } from '@/sections/AssetStatusWarning';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { useGlobalState } from '@/state/global.state';
import {
  Asset,
  AssetLabels,
  AssetStatus,
  Risk,
  RiskScanMessage,
} from '@/types';
import { useMergeStatus } from '@/utils/api';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';

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
  const {
    modal: {
      risk: {
        onOpenChange: setShowAddRisk,
        selectedAssets,
        onSelectedAssetsChange: setSelectedAssets,
      },
      asset: { onOpenChange: setShowAddAsset },
    },
  } = useGlobalState();

  const { data: stats = {}, status: countsStatus } = useCounts({
    resource: 'asset',
    filterByGlobalSearch: false,
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

  const { getAssetDrawerLink } = useOpenDrawer();
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
      to: item => getAssetDrawerLink(item),
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
        <AssetStatusChip status={status} className={'w-20 px-2 py-1'} />
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

        // On click of the X mark icon, navigate to /app/risks?hashSearch=#fqdn
        if (riskSummary && Object.keys(riskSummary)?.length > 0) {
          return (
            <Link
              className={`rounded-[2px] hover:bg-layer2`}
              to={{
                pathname: getRoute(['app', 'risks']),
                search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent('#' + item.dns)}`,
              }}
            >
              <XMarkIcon
                className={`size-6 stroke-red-600 text-red-600`}
                aria-hidden="true"
              />
            </Link>
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

  // get selected class from url param class:CLASS_NAME
  const searchParams = new URLSearchParams(window.location.search);
  const genericSearch = searchParams.get(StorageKey.GENERIC_SEARCH);
  const selectedFilter = genericSearch?.replace('class:', '');

  return (
    <div className="flex w-full flex-col">
      <Table
        name="assets"
        filters={
          <Dropdown
            styleType="header"
            label={selectedFilter ? AssetLabels[selectedFilter] : 'All Assets'}
            endIcon={
              <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
            }
            menu={{
              items: [
                {
                  label: 'All Assets',
                  labelSuffix: Object.keys(stats)
                    .reduce((acc, key) => acc + stats[key], 0)
                    .toLocaleString(),
                  value: '',
                },
                {
                  label: 'Divider',
                  type: 'divider',
                },
                ...Object.entries(AssetLabels).map(([key, label]) => {
                  return {
                    label,
                    labelSuffix: stats[key]?.toLocaleString() || 0,
                    value: key,
                  };
                }),
              ],
              onClick: value => {
                const pathName = getRoute(['app', 'assets']);
                if (value === '') {
                  navigate(pathName);
                } else {
                  const filter = `class:${value}`;
                  const searchQuery = `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(filter)}`;
                  navigate(`${pathName}${searchQuery}`);
                }
              },
              value: selectedFilter ?? undefined,
            }}
          />
        }
        selection={{}}
        primaryAction={() => {
          return {
            label: 'Add Asset',
            icon: <AssetsIcon className="size-5" />,
            onClick: () => {
              setShowAddAsset(true);
            },
          };
        }}
        actions={(assets: Asset[]) => {
          return {
            menu: {
              items: [
                {
                  label: 'Add Risk',
                  icon: <RisksIcon />,
                  onClick: () => {
                    setSelectedAssets(assets);
                    setShowAddRisk(true);
                  },
                },
                { type: 'divider', label: 'Divider' },
                {
                  label: 'High Priority',
                  icon: <ExclamationCircleIcon />,
                  onClick: () => {
                    setSelectedAssets(assets);
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.ActiveHigh);
                  },
                },
                {
                  label: 'Standard Priority',
                  icon: <CheckCircleIcon />,
                  onClick: () => updateStatus(assets, AssetStatus.Active),
                },
                {
                  label: 'Stop Scanning',
                  icon: <PauseIcon />,
                  onClick: () => {
                    setSelectedAssets(assets);
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.Frozen);
                  },
                },
                { type: 'divider', label: 'Divider' },
                {
                  label: "I don't recognize this",
                  icon: <QuestionMarkCircleIcon />,
                  onClick: () => updateStatus(assets, AssetStatus.Unknown),
                },
              ],
            },
          };
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
          icon: <SpinnerIcon className="size-[100px]" />,
          title: 'Scans Running',
          description:
            'Your seeds are being scanned and your assets will appear here soon',
        }}
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

export default Assets;
