import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { PlusIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { HorseIcon } from '@/components/icons/Horse.icon';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import SourceDropdown from '@/components/SourceDropdown';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { getAssetStatusProperties } from '@/components/ui/AssetStatusChip';
import { AttributeFilter } from '@/components/ui/AttributeFilter';
import { useMy } from '@/hooks';
import {
  AssetsSnackbarTitle,
  getStartMessage,
  useUpdateAsset,
} from '@/hooks/useAssets';
import { useFilter } from '@/hooks/useFilter';
import { useIntegration } from '@/hooks/useIntegration';
import { AssetStatusWarning } from '@/sections/AssetStatusWarning';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { getFilterLabel } from '@/sections/RisksTable';
import { parseKeys } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';
import { Asset, AssetStatus, AssetStatusLabel, Risk } from '@/types';
import { useMergeStatus } from '@/utils/api';

type Severity = 'I' | 'L' | 'M' | 'H' | 'C';
type SeverityOpenCounts = Partial<Record<Severity, Risk[]>>;

export function buildOpenRiskDataset(
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
  const {
    isLoading,
    status: assetsStatus,
    data: assets = [],
    refetch,
    error,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isError,
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
  const [sourceFilter, setSourceFilter] = useFilter(
    [''],
    'asset-source-filter',
    setSelectedRows
  );
  const [assetsWithAttributesFilter, setAssetsWithAttributesFilter] = useState<
    string[]
  >([]);

  const status = useMergeStatus(riskStatus, assetsStatus);
  const { getAssetDrawerLink } = getDrawerLink();
  const openRiskDataset = useMemo(
    () => buildOpenRiskDataset(risks as Risk[]),
    [risks]
  );
  const [showAssetStatusWarning, setShowAssetStatusWarning] =
    useState<boolean>(false);
  const [assetStatus, setAssetStatus] = useState<AssetStatus | ''>('');

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

  // Filter assets list with the selected attributes
  const assetsObjectWithAttributesFilter: Asset[] = useMemo(() => {
    return assetsWithAttributesFilter &&
      Array.isArray(assetsWithAttributesFilter) &&
      assetsWithAttributesFilter.length > 0
      ? ((assetsWithAttributesFilter as string[])
          .map(key => assets.find(asset => asset.key === key))
          .filter(Boolean) as Asset[])
      : assets;
  }, [assets, assetsWithAttributesFilter]);

  // merge risk data with asset data
  const assetsWithRisk: AssetsWithRisk[] = assetsObjectWithAttributesFilter.map(
    asset => {
      const riskSummary = openRiskDataset[asset.dns];

      if (riskSummary) {
        return { ...asset, riskSummary };
      }

      return asset;
    }
  );

  const filteredAssets = useMemo(() => {
    let filteredAssets = assetsWithRisk;

    if (priorityFilter?.filter(Boolean).length > 0) {
      filteredAssets = filteredAssets.filter(({ status }) =>
        priorityFilter.includes(status)
      );
    }

    if (sourceFilter?.filter(Boolean).length > 0) {
      filteredAssets = filteredAssets.filter(({ source }) =>
        sourceFilter.includes(source)
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
      label: 'Priority',
      id: 'name',
      fixedWidth: 100,
      cell: (asset: AssetsWithRisk) => {
        const integration = isIntegration(asset);
        const containsRisks = Object.values(asset.riskSummary || {}).length > 0;
        const simplifiedStatus = asset.status.startsWith('F')
          ? AssetStatus.Frozen
          : asset.status;
        const { detail } = getAssetStatusProperties(simplifiedStatus);
        const icons: JSX.Element[] = [];

        icons.push(
          <Tooltip title={detail || simplifiedStatus}>
            {getAssetStatusIcon(simplifiedStatus)}
          </Tooltip>
        );
        if (containsRisks) {
          icons.push(
            <div>
              <Tooltip title="Contains open risks">
                <div>
                  <RisksIcon className="size-5" />
                </div>
              </Tooltip>
            </div>
          );
        }
        if (integration) {
          icons.push(
            <Tooltip title="Integration">
              <PuzzlePieceIcon className="size-5" />
            </Tooltip>
          );
        }

        return <div className="flex gap-2">{icons}</div>;
      },
    },
    {
      label: 'Asset',
      id: 'name',
      to: item => getAssetDrawerLink(item),
      copy: true,
    },
    {
      label: 'Status',
      id: 'status',
      cell: (asset: Asset) => {
        const simplifiedStatus = asset.status.startsWith('F')
          ? AssetStatus.Frozen
          : asset.status;
        return AssetStatusLabel[simplifiedStatus];
      },
    },
    {
      label: 'DNS',
      id: 'dns',
      className: 'hidden md:table-cell',
      copy: true,
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
  ];

  const priorityOptions = useMemo(
    () =>
      Object.entries(AssetStatusLabel).map(([value, label]) => ({
        label,
        labelSuffix: assetsWithRisk.filter(({ status }) =>
          status.startsWith(value)
        ).length,
        value,
      })),
    [assetsWithRisk]
  );

  function updateStatus(assets: string[], status: AssetStatus) {
    const showBulk = showBulkSnackbar(assets.length);
    setShowAssetStatusWarning(false);
    setAssetStatus('');

    assets.forEach(assetKey => {
      updateAsset(
        {
          key: assetKey,
          name: parseKeys.assetKey(assetKey).name,
          status,
          showSnackbar: !showBulk,
        },
        {
          onSuccess: () => {
            if (showBulk) {
              Snackbar({
                title: `${assets.length} assets ${AssetsSnackbarTitle[status]}`,
                description: getStartMessage(status),
                variant: 'success',
              });
            }
          },
        }
      );
    });
  }

  useEffect(() => {
    if (
      !isError &&
      !isFetching &&
      assets.length > 0 &&
      filteredAssets.length === 0
    ) {
      fetchNextPage();
    }
  }, [
    isError,
    isFetching,
    JSON.stringify(assets),
    JSON.stringify(filteredAssets),
  ]);

  return (
    <div className="flex w-full flex-col">
      <Table
        name="assets"
        filters={
          <div className="flex gap-4">
            <AttributeFilter
              onAssetsChange={assets => setAssetsWithAttributesFilter(assets)}
            />
            <Dropdown
              styleType="header"
              label={getFilterLabel(
                'Statuses',
                priorityFilter,
                priorityOptions
              )}
              endIcon={
                <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
              }
              menu={{
                items: [
                  {
                    label: 'All Statuses',
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
            <SourceDropdown
              type="asset"
              onSelect={selected => setSourceFilter(selected)}
              types={['Provided', 'Discovered']}
            />
          </div>
        }
        resize={true}
        selection={{ value: selectedRows, onChange: setSelectedRows }}
        primaryAction={() => {
          return {
            label: 'Asset Discovery',
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
                    setSelectedAssets(assets.map(asset => asset.key));
                    setShowAddRisk(true);
                  },
                },
                { type: 'divider', label: 'Divider' },
                {
                  label: 'Change Status',
                  type: 'label',
                },
                {
                  label: AssetStatusLabel[AssetStatus.ActiveHigh],
                  icon: getAssetStatusIcon(AssetStatus.ActiveHigh),
                  disabled: assets.every(
                    asset => asset.status === AssetStatus.ActiveHigh
                  ),
                  onClick: () => {
                    setSelectedAssets(assets.map(asset => asset.key));
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
                  onClick: () =>
                    updateStatus(
                      assets.map(asset => asset.key),
                      AssetStatus.Active
                    ),
                },
                {
                  label: AssetStatusLabel[AssetStatus.ActiveLow],
                  icon: getAssetStatusIcon(AssetStatus.ActiveLow),
                  disabled: assets.every(
                    asset => asset.status === AssetStatus.ActiveLow
                  ),
                  onClick: () =>
                    updateStatus(
                      assets.map(asset => asset.key),
                      AssetStatus.ActiveLow
                    ),
                },
                {
                  label: AssetStatusLabel[AssetStatus.Frozen],
                  icon: getAssetStatusIcon(AssetStatus.Frozen),
                  onClick: () => {
                    setSelectedAssets(assets.map(asset => asset.key));
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.Frozen);
                  },
                },
                {
                  label: AssetStatusLabel[AssetStatus.Deleted],
                  icon: getAssetStatusIcon(AssetStatus.Deleted),
                  onClick: () => {
                    setSelectedAssets(assets.map(asset => asset.key));
                    setShowAssetStatusWarning(true);
                    setAssetStatus(AssetStatus.Deleted);
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
          icon: <HorseIcon />,
          title:
            assets.length === 0
              ? 'Discovering Assets...'
              : 'No Matching Assets',
          description:
            assets.length === 0
              ? 'We are currently scanning for assets. They will appear here as soon as they are discovered. Please check back shortly.'
              : 'Try adjusting your filters or add new assets to see results.',
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
