import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

import { Chip } from '@/components/Chip';
import { Dropdown } from '@/components/Dropdown';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { SpinnerIcon } from '@/components/icons/Spinner.icon';
import { Link } from '@/components/Link';
import { OverflowText } from '@/components/OverflowText';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import {
  AssetStatusChip,
  getAssetStatusProperties,
} from '@/components/ui/AssetStatusChip';
import { useMy } from '@/hooks';
import { AssetsSnackbarTitle, useUpdateAsset } from '@/hooks/useAssets';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { useIntegration } from '@/hooks/useIntegration';
import { AssetStatusWarning } from '@/sections/AssetStatusWarning';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { getFilterLabel } from '@/sections/RisksTable';
import { useGlobalState } from '@/state/global.state';
import {
  Asset,
  AssetLabels,
  AssetStatus,
  AssetStatusLabel,
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

  const { data: stats = {} } = useCounts({
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
  const { isIntegration } = useIntegration();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useFilter(
    [''],
    'asset-priority',
    setSelectedRows
  );

  const status = useMergeStatus(riskStatus, assetsStatus);

  const { getAssetDrawerLink } = getDrawerLink();
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

  const filteredAssets = useMemo(() => {
    let filteredAssets = assetsWithRisk;
    if (priorityFilter?.filter(Boolean).length > 0) {
      filteredAssets = filteredAssets.filter(({ status }) =>
        priorityFilter.includes(status)
      );
    }
    const sortOrder = Object.keys(AssetStatusLabel);
    filteredAssets = filteredAssets.sort((a, b) => {
      return (
        sortOrder.indexOf(a.status) - sortOrder.indexOf(b.status) ||
        new Date(b.updated).getTime() - new Date(a.updated).getTime()
      );
    });
    return filteredAssets;
  }, [assetsWithRisk, priorityFilter]);

  const columns: Columns<AssetsWithRisk> = [
    {
      label: 'Asset Name',
      id: 'name',
      className: 'w-full',
      to: item => getAssetDrawerLink(item),
      copy: true,
      cell: (asset: Asset) => {
        const integration = isIntegration(asset);
        const { detail } = getAssetStatusProperties(asset.status);
        const icon = getAssetStatusIcon(asset.status);
        return (
          <div className="flex gap-2">
            <Tooltip title={detail}>
              <span className="text-default">{icon}</span>
            </Tooltip>
            <span>{asset.name}</span>
            {integration && <Chip>Integration</Chip>}
          </div>
        );
      },
    },
    {
      label: 'DNS',
      id: 'dns',
      className: 'w-full hidden md:table-cell',
      cell: (asset: Asset) => {
        return <OverflowText text={asset.dns} truncateType="center" />;
      },
      copy: true,
    },
    {
      label: 'Status',
      id: 'status',
      fixedWidth: 150,
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

  const priorityOptions = useMemo(
    () =>
      Object.entries(AssetStatusLabel).map(([value, label]) => ({
        label,
        labelSuffix: assetsWithRisk.filter(({ status }) => status === value)
          .length,
        value,
      })),
    [assetsWithRisk]
  );

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
          <div className="flex gap-4">
            <Dropdown
              styleType="header"
              label={
                selectedFilter && AssetLabels[selectedFilter]
                  ? AssetLabels[selectedFilter]
                  : 'All Assets'
              }
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
            <Dropdown
              styleType="header"
              label={getFilterLabel(
                'Priority',
                priorityFilter,
                priorityOptions
              )}
              endIcon={
                <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
              }
              menu={{
                items: [
                  {
                    label: 'All Priorities',
                    labelSuffix: assets.length.toLocaleString(),
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...priorityOptions,
                ],
                onSelect: selectedRows => setPriorityFilter(selectedRows),
                value: priorityFilter,
                multiSelect: true,
              }}
            />
          </div>
        }
        resize={true}
        selection={{ value: selectedRows, onChange: setSelectedRows }}
        primaryAction={() => {
          return {
            label: 'Configure',
            icon: <AssetsIcon className="size-5" />,
            startIcon: <PlusIcon className="size-5" />,
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
                  label: AssetStatusLabel[AssetStatus.ActiveHigh],
                  icon: getAssetStatusIcon(AssetStatus.ActiveHigh),
                  disabled: assets.every(
                    asset => asset.status === AssetStatus.ActiveHigh
                  ),
                  onClick: () => {
                    setSelectedAssets(assets);
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.ActiveHigh);
                  },
                },
                {
                  label: AssetStatusLabel[AssetStatus.Active],
                  icon: getAssetStatusIcon(AssetStatus.Active),
                  disabled: assets.every(
                    asset => asset.status === AssetStatus.Active
                  ),
                  onClick: () => updateStatus(assets, AssetStatus.Active),
                },
                {
                  label: AssetStatusLabel[AssetStatus.ActiveLow],
                  icon: getAssetStatusIcon(AssetStatus.ActiveLow),
                  disabled: assets.every(
                    asset => asset.status === AssetStatus.ActiveLow
                  ),
                  onClick: () => updateStatus(assets, AssetStatus.ActiveLow),
                },
                {
                  label: AssetStatusLabel[AssetStatus.Frozen],
                  icon: getAssetStatusIcon(AssetStatus.Frozen),
                  onClick: () => {
                    setSelectedAssets(assets);
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.Frozen);
                  },
                },
              ],
            },
          };
        }}
        columns={columns}
        data={filteredAssets}
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
