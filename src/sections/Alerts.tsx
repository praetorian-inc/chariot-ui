import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRightIcon, Inbox, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/Button';
import { getRiskSeverityIcon } from '@/components/icons/RiskSeverity.icon';
import { Tooltip } from '@/components/Tooltip';
import { ClosedStateModal } from '@/components/ui/ClosedStateModal';
import { useUpdateAsset } from '@/hooks/useAssets';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useGetAccountAlerts } from '@/hooks/useGetAccountAlerts';
import { useReRunJob } from '@/hooks/useJobs';
import { useUpdateRisk } from '@/hooks/useRisks';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import {
  Asset,
  AssetStatus,
  AssetStatusLabel,
  Risk,
  RiskSeverity,
  RiskStatus,
  RiskStatusLabel,
  SeverityDef,
} from '@/types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/date.util';

const isAsset = (item: Asset | Risk): item is Asset => {
  return Object.values(AssetStatus).includes(item?.status as AssetStatus);
};

const Alerts: React.FC = () => {
  const [query, setQuery] = useState<string | null>(null);
  const [isClosedSubStateModalOpen, setIsClosedSubStateModalOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<Asset | Risk | null>(null);

  const { mutateAsync: reRunJob, status: reRunJobStatus } = useReRunJob();
  const { data: alerts, refetch: refetchAlerts } = useGetAccountAlerts();
  const { getRiskDrawerLink, getAssetDrawerLink } = getDrawerLink();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { mutateAsync: updateAsset, status: updateAssetStatus } =
    useUpdateAsset();
  const { mutateAsync: updateRisk, status: updateRiskStatus } = useUpdateRisk();

  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery) {
      setQuery(initialQuery);
    } else if (alerts && alerts.length > 0) {
      setQuery(alerts[0].query);
    }
  }, [alerts, searchParams]);

  const handleCategoryClick = (query: string) => {
    setQuery(query);
  };

  const { data, refetch: refetchData } = useGenericSearch(
    {
      query: query ?? '',
    },
    {
      enabled: !!query,
    }
  );

  function handleAssetChange(asset: Asset, status: AssetStatus) {
    updateAsset({
      key: asset.key,
      name: asset.name,
      status,
      showSnackbar: true,
    }).then(() => {
      refetchAlerts();
      refetchData();
    });
  }

  function handleRiskChange(
    risk: Risk,
    status: RiskStatus,
    severity: RiskSeverity
  ) {
    updateRisk({
      key: risk.key,
      name: risk.name,
      status: `${status}${severity}`,
      showSnackbar: true,
      comment: risk.comment,
    }).then(() => {
      refetchAlerts();
      refetchData();
    });
  }

  const handleOpenModal = (item: Asset | Risk) => {
    setSelectedItem(item);
    setIsClosedSubStateModalOpen(true);
  };

  const renderItemDetails = (item: Asset | Risk) => {
    const handleViewLink = isAsset(item)
      ? getAssetDrawerLink(item)
      : getRiskDrawerLink(item);

    return (
      <div
        className="flex w-full cursor-pointer items-center space-x-4 border-b border-gray-200 bg-white p-4 hover:bg-gray-100"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          navigate(handleViewLink);
        }}
      >
        <div className="flex space-x-2">
          {isAsset(item) && item.status === AssetStatus.ActiveLow && (
            <>
              <Tooltip title="Enable Risk Scanning">
                <Button
                  styleType="primary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAssetChange(item, AssetStatus.Active);
                  }}
                  disabled={updateAssetStatus === 'pending'}
                >
                  Enable
                </Button>
              </Tooltip>
              <Tooltip title="Mark as Deleted">
                <Button
                  styleType="secondary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAssetChange(item, AssetStatus.Deleted);
                  }}
                  disabled={updateAssetStatus === 'pending'}
                >
                  Delete
                </Button>
              </Tooltip>
            </>
          )}
          {!isAsset(item) && item.status[0] === RiskStatus.Triaged && (
            <>
              <Tooltip title="Mark as Open">
                <Button
                  styleType="primary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRiskChange(
                      item,
                      RiskStatus.Opened,
                      item.status[1] as RiskSeverity
                    );
                  }}
                  disabled={updateRiskStatus === 'pending'}
                >
                  Accept
                </Button>
              </Tooltip>
              <Tooltip title="Mark as Closed">
                <Button
                  styleType="secondary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenModal(item);
                  }}
                  disabled={updateRiskStatus === 'pending'}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {!isAsset(item) && item.status[0] === RiskStatus.Machine && (
            <>
              <Tooltip title="Mark as Closed">
                <Button
                  styleType="primary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenModal(item);
                  }}
                  disabled={updateRiskStatus === 'pending'}
                >
                  Close
                </Button>
              </Tooltip>
              <Tooltip title="Mark as Open">
                <Button
                  styleType="secondary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRiskChange(
                      item,
                      RiskStatus.Opened,
                      item.status[1] as RiskSeverity
                    );
                  }}
                  disabled={updateRiskStatus === 'pending'}
                >
                  Reopen
                </Button>
              </Tooltip>
            </>
          )}
          {!isAsset(item) && item.status[0] === RiskStatus.Opened && (
            <>
              <Tooltip title="Rerun capability against this asset">
                <Button
                  styleType="primary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    reRunJob({
                      capability: item.source,
                      dns: item.dns,
                    });
                  }}
                  disabled={reRunJobStatus === 'pending'}
                >
                  Rescan
                </Button>
              </Tooltip>
              <Tooltip title="Mark as Closed">
                <Button
                  styleType="secondary"
                  className="h-8"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenModal(item);
                  }}
                  disabled={updateRiskStatus === 'pending'}
                >
                  Close
                </Button>
              </Tooltip>
            </>
          )}
        </div>
        <div className="flex flex-1 items-center space-x-3 overflow-hidden">
          {!isAsset(item) && (
            <Tooltip
              title={`${SeverityDef[item.status[1] as RiskSeverity]} Severity`}
            >
              {getRiskSeverityIcon(item.status[1] as RiskSeverity)}
            </Tooltip>
          )}
          <div className="flex flex-1 items-center space-x-3 overflow-hidden">
            <div className="flex w-full flex-col overflow-hidden">
              <Tooltip
                title={item.name ?? (isAsset(item) ? item.dns : item.key)}
              >
                <span className="truncate text-lg font-semibold text-gray-800 hover:text-gray-900">
                  {item.name ?? (isAsset(item) ? item.dns : item.key)}
                </span>
              </Tooltip>
              <span className="text-xs text-gray-500">
                {item.created !== item.updated ? (
                  <Tooltip title={`Created ${formatDate(item.created)}`}>
                    Updated {formatDate(item.updated)}
                  </Tooltip>
                ) : (
                  <span>
                    {isAsset(item)
                      ? item.source === 'provided'
                        ? 'Added'
                        : 'Discovered'
                      : 'Identified'}{' '}
                    {formatDate(item.created)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip title="Status">
            <span className="rounded border border-red-400 px-2 py-1 text-xs font-medium text-red-500">
              {isAsset(item)
                ? AssetStatusLabel[item.status as AssetStatus]
                : RiskStatusLabel[item.status[0] as RiskStatus]}
            </span>
          </Tooltip>
        </div>
        <ChevronRightIcon className="ml-auto size-5 text-gray-500" />
      </div>
    );
  };

  const items = useMemo(() => data?.assets || data?.risks || [], [data]);
  const totalAlerts = alerts?.reduce((acc, alert) => acc + alert.count, 0);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 77, // Adjusted size to fit the new layout
    overscan: 5,
  });

  return (
    <div
      className="flex rounded-sm border border-gray-200 bg-white"
      style={{ height: 'calc(100vh - 135px)' }}
    >
      {/* Sidebar */}
      <div className="w-1/4 overflow-auto border-r border-gray-200 bg-zinc-50 bg-gradient-to-l px-2 py-4">
        <h2 className="mb-4 flex items-center py-2 text-lg font-medium text-gray-800">
          <Inbox className="ml-3 mr-2 size-8 stroke-[2px] " />
          <span className="mr-2 text-xl font-bold">
            All Alerts{' '}
            {alerts && alerts.length && (
              <span>({totalAlerts?.toLocaleString()})</span>
            )}
          </span>
        </h2>
        {alerts === null && (
          <div className="flex items-center justify-between px-3 italic text-gray-500">
            <p className="text-md select-none font-medium">No alerts found</p>
          </div>
        )}
        <div>
          {(alerts ?? []).map((alert, index) => (
            <div
              key={index}
              className={cn(
                'flex cursor-pointer items-start p-4 ',
                query === alert.query
                  ? 'bg-highlight/10 '
                  : ' hover:bg-gray-100'
              )}
              onClick={() => {
                searchParams.set('query', alert.query);
                setSearchParams(searchParams);
                handleCategoryClick(alert.query);
              }}
            >
              <div className="flex flex-col space-y-1">
                <p className="text-md select-none font-medium">{alert.label}</p>

                <span className="text-xs font-normal text-gray-500">
                  {alert.count} {alert.label.split(' ')[0].toLowerCase()}
                </span>
              </div>
            </div>
          ))}
          {alerts?.length === 0 && (
            <div
              className="flex cursor-pointer items-center justify-between space-x-2 border-l-[3px] border-brand bg-highlight/10 p-3"
              onClick={() => {
                searchParams.set('query', '');
                setSearchParams(searchParams);
              }}
            >
              <p className="text-md select-none font-medium">No alerts found</p>
              <span className="text-md font-medium">View Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {alerts === null && (
          <div className="mt-16 flex flex-1 items-center justify-center">
            <div className="text-center">
              <ShieldCheck className="mx-auto mb-4 size-52 stroke-[1px] text-gray-900" />
              <h3 className="mt-10 text-5xl font-bold text-gray-900">
                You’re all caught up!
              </h3>
              <p className="mt-4 text-lg text-gray-600">
                No alerts to show. Enjoy your peace of mind.
              </p>
            </div>
          </div>
        )}
        {query && (
          <div className="flex h-full flex-col">
            <div ref={parentRef} className="flex-1 overflow-auto">
              <div
                className="relative"
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                }}
              >
                {virtualizer.getVirtualItems().map(virtualItem => (
                  <div
                    key={virtualItem.key}
                    className="absolute left-0 top-0 w-full"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {renderItemDetails(items[virtualItem.index])}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ClosedStateModal
        isOpen={isClosedSubStateModalOpen}
        onClose={() => setIsClosedSubStateModalOpen(false)}
        onStatusChange={({ status }) => {
          if (selectedItem) {
            handleRiskChange(
              selectedItem,
              status,
              selectedItem.status[1] as RiskSeverity
            );
            setSelectedItem(null);
          }
        }}
      />
    </div>
  );
};

export default Alerts;
