import React, { useState } from 'react';
import { PlusIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

import AssetStatusDropdown from '@/components/AssetStatusDropdown';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { HorseIcon } from '@/components/icons/Horse.icon';
import SourceDropdown from '@/components/SourceDropdown';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { getAssetStatusProperties } from '@/components/ui/AssetStatusChip';
import { AttributeFilter } from '@/components/ui/AttributeFilter';
import { useGetAssets, useUpdateAsset } from '@/hooks/useAssets';
import { useIntegration } from '@/hooks/useIntegration';
import { AssetStatusWarning } from '@/sections/AssetStatusWarning';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { parseKeys } from '@/sections/SearchByType';
import { useGlobalState } from '@/state/global.state';
import {
  Asset,
  AssetFilters,
  AssetStatus,
  AssetStatusLabel,
  AssetsWithRisk,
  Risk,
  Severity,
  SeverityOpenCounts,
} from '@/types';
import { useStorage } from '@/utils/storage/useStorage.util';

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

  const [filters, setFilters] = useStorage<AssetFilters>(
    { queryKey: 'assetFilters' },
    { search: '', attributes: [], priorities: [], sources: [] }
  );

  const {
    data: assets,
    status: assetsStatus,
    error: assetsError,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAssets({
    filters,
  });

  const { getAssetDrawerLink } = getDrawerLink();
  const { isIntegration } = useIntegration();
  const { mutateAsync: updateAsset } = useUpdateAsset();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showAssetStatusWarning, setShowAssetStatusWarning] =
    useState<boolean>(false);
  const [assetStatus, setAssetStatus] = useState<AssetStatus | ''>('');

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

  function updateStatus(assets: string[], status: AssetStatus) {
    setShowAssetStatusWarning(false);
    setAssetStatus('');

    assets.forEach(assetKey => {
      updateAsset(
        {
          key: assetKey,
          name: parseKeys.assetKey(assetKey).name,
          status,
        },
        {
          onSuccess: () => {
            setSelectedRows([]);
          },
        }
      );
    });
  }

  return (
    <div className="flex w-full flex-col">
      <Table
        name="assets"
        search={{
          value: filters.search,
          onChange: updatedSearch => {
            setFilters(prevFilters => {
              return { ...prevFilters, search: updatedSearch };
            });
          },
        }}
        filters={
          <div className="flex gap-4">
            <AttributeFilter
              value={filters.attributes}
              onChange={attributes => {
                setFilters(prevFilters => {
                  return { ...prevFilters, attributes };
                });
              }}
            />
            <AssetStatusDropdown
              onSelect={(selected: string[]) => {
                setFilters(prevFilters => {
                  return {
                    ...prevFilters,
                    priorities: selected as AssetStatus[],
                  };
                });
              }}
            />
            <SourceDropdown
              type="asset"
              onSelect={selected => {
                setFilters(prevFilters => {
                  return {
                    ...prevFilters,
                    sources: selected,
                  };
                });
              }}
            />
          </div>
        }
        resize={true}
        selection={{ value: selectedRows, onChange: setSelectedRows }}
        primaryAction={() => {
          return {
            label: 'Add Asset',
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
                  onClick: () => {
                    updateStatus(
                      assets.map(asset => asset.key),
                      AssetStatus.Active
                    );
                  },
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
        data={assets}
        error={assetsError}
        status={assetsStatus}
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
