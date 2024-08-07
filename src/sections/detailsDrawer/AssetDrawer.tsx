import { ReactNode, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircleIcon,
  History as HistoryIcon,
  NotepadText,
} from 'lucide-react';

import { Drawer } from '@/components/Drawer';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { getRiskSeverityIcon } from '@/components/icons/RiskSeverity.icon';
import { Loader } from '@/components/Loader';
import { Timeline } from '@/components/Timeline';
import { Tooltip } from '@/components/Tooltip';
import { AssetStatusDropdown } from '@/components/ui/AssetPriorityDropdown';
import { useMy } from '@/hooks';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useReRunJob } from '@/hooks/useJobs';
import { buildOpenRiskDataset } from '@/sections/Assets';
import { AddAttribute } from '@/sections/detailsDrawer/AddAttribute';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import {
  Asset,
  AssetStatusLabel,
  EntityHistory,
  Risk,
  RiskSeverity,
  RiskStatus,
  SeverityDef,
} from '@/types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/date.util';
import { getSeverityClass } from '@/utils/getSeverityClass.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

interface Props {
  compositeKey: string;
  open: boolean;
}

const { getAssetDrawerLink, getRiskDrawerLink } = getDrawerLink();

function getHistoryDiff(history: EntityHistory): {
  title: ReactNode;
  updated: string;
} {
  if (history.from === '') {
    return {
      title: (
        <div className="whitespace-break-spaces">
          <strong>First Tracked</strong> as{' '}
          <strong>
            {AssetStatusLabel[history.to as keyof typeof AssetStatusLabel]}
          </strong>
        </div>
      ),
      updated: formatDate(history.updated),
    };
  } else {
    return {
      title: (
        <div className="whitespace-break-spaces">
          {history.by ? (
            <span>
              {history.by} changed the{' '}
              <span className="font-semibold">Status</span> from{' '}
            </span>
          ) : (
            <span>
              Changed the <span className="font-semibold">Status</span> from{' '}
            </span>
          )}
          <strong>
            {AssetStatusLabel[history.from as keyof typeof AssetStatusLabel]}
          </strong>{' '}
          to{' '}
          <strong>
            {AssetStatusLabel[history.to as keyof typeof AssetStatusLabel]}
          </strong>
        </div>
      ),
      updated: formatDate(history.updated),
    };
  }
}

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }) => {
  const [, dns] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const attributeFilter = `source:#asset${compositeKey}`;
  const linkedIpsFilter = `#${dns}#`;
  const { removeSearchParams } = useSearchParams();
  const navigate = useNavigate();

  const { data: assets = [], status: assetsStatus } = useMy(
    {
      resource: 'asset',
      query: compositeKey,
    },
    { enabled: open }
  );
  const { data: attributesGenericSearch, status: attributesStatus } =
    useGenericSearch(
      {
        query: attributeFilter,
        exact: true,
      },
      { enabled: open }
    );

  const { data: risks = [], status: risksStatus } = useMy(
    {
      resource: 'risk',
      query: riskFilter,
    },
    { enabled: open }
  );
  const {
    data: rawLinkedHostnamesIncludingSelf = [],
    status: linkedIpsStatus,
  } = useMy(
    {
      resource: 'asset',
      query: linkedIpsFilter,
    },
    { enabled: open }
  );

  const { mutateAsync: runJob } = useReRunJob();

  const openRiskDataset = useMemo(
    () => buildOpenRiskDataset(risks as Risk[]),
    [risks]
  );

  const asset: Asset = assets[0] || {};
  const history = useMemo(() => {
    const assetHistory = asset.history || [];
    const noHistory = assetHistory.length === 0;

    const firstTrackedHistory: EntityHistory = {
      from: '',
      to: noHistory ? asset.status : asset.history[0].from,
      updated: asset.created,
    };

    return [firstTrackedHistory, ...assetHistory];
  }, [asset.history]);

  const isInitialLoading =
    assetsStatus === 'pending' ||
    risksStatus === 'pending' ||
    linkedIpsStatus === 'pending' ||
    attributesStatus === 'pending';

  const linkedHostnames = rawLinkedHostnamesIncludingSelf.filter(
    ({ dns }) => dns !== asset.dns
  );
  const linkedIps = rawLinkedHostnamesIncludingSelf.filter(
    ({ name }) => name !== asset.dns
  );

  const openRisks = risks.filter(
    ({ status }) => status?.[0] === RiskStatus.Opened
  );

  return (
    <Drawer
      open={open}
      onClose={() => removeSearchParams(StorageKey.DRAWER_COMPOSITE_KEY)}
      onBack={() => navigate(-1)}
      className={cn(
        'w-full rounded-t-lg pb-0 shadow-lg pt-6',
        openRisks.length === 0 ? 'bg-zinc-100' : 'bg-red-50'
      )}
      header={
        isInitialLoading ? null : (
          <div className="flex w-full items-center justify-between px-10 pt-0">
            <div className="flex flex-row items-center justify-center space-x-2">
              <h2 className="mt-0 text-2xl font-medium tracking-wide text-gray-900">
                {asset.name}{' '}
              </h2>
              {asset.dns && asset.dns !== asset.name && (
                <p className="text-md rounded-sm bg-zinc-800/10 px-4 py-2 font-normal text-gray-500">
                  {asset.dns}
                </p>
              )}
            </div>
          </div>
        )
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-full flex-col gap-2 px-8 pt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Risks Section */}
            {openRisks.length === 0 ? (
              <div className="rounded-lg bg-white p-8  transition-all hover:rounded-lg hover:shadow-md">
                <h3 className="mb-4 text-2xl font-semibold tracking-wide text-green-600">
                  <CheckCircleIcon className="mr-1 inline size-6 text-green-600" />
                  This Asset is Safe!
                </h3>
                <p className="text-sm text-gray-700">
                  No risks have been detected for this asset. However, it&apos;s
                  always a good practice to regularly monitor and scan for any
                  new potential threats.
                </p>
                <div className="mt-4">
                  <button
                    className="text-sm font-medium text-blue-500 hover:underline"
                    onClick={() => {
                      runJob({
                        capability: 'nuclei',
                        jobKey: `#asset#${asset.name}#${asset.dns}`,
                      });
                    }}
                  >
                    Schedule a scan now
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500 bg-white p-8  transition-all hover:rounded-lg hover:shadow-md">
                <h3 className="mb-4 text-2xl font-semibold tracking-wide text-red-600">
                  <AlertTriangle className="mr-1 inline size-5 text-red-600" />
                  This Asset is at Risk!
                </h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="w-[80px] p-2 text-left text-sm font-medium text-red-600">
                        Priority
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-red-600">
                        Name
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-red-600">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {openRisks.map(({ dns, name, status, updated }) => {
                      const riskSeverityKey = status?.[1] as RiskSeverity;

                      return (
                        <tr
                          key={dns}
                          className={cn(
                            'border-b',
                            getSeverityClass(riskSeverityKey)
                          )}
                        >
                          <td className="p-2">
                            <div className="flex flex-row items-center space-x-2">
                              <Tooltip
                                title={
                                  SeverityDef[riskSeverityKey] + ' Severity'
                                }
                              >
                                {getRiskSeverityIcon(
                                  riskSeverityKey,
                                  'h-4 w-4 text-red-600'
                                )}
                              </Tooltip>
                              <span className="text-xs">
                                {SeverityDef[riskSeverityKey]}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-sm font-medium text-blue-500">
                            <Link
                              to={getRiskDrawerLink({ dns, name })}
                              className="hover:underline"
                            >
                              {name}
                            </Link>
                          </td>
                          <td className="p-2 text-sm">{formatDate(updated)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              {/* Actions Section */}
              <div className="flex flex-row justify-end space-x-4 text-right">
                <AddAttribute resourceKey={asset.key} />
                <AssetStatusDropdown asset={asset} />
              </div>

              {/* Attributes Section */}
              <div className="rounded-lg  bg-white p-8  transition-all hover:rounded-lg hover:shadow-md">
                <div className="flex flex-row justify-between">
                  <h3 className="mb-4 text-2xl font-semibold tracking-wide text-gray-900">
                    <NotepadText className="mr-1 inline size-6 text-gray-800" />
                    Attributes
                  </h3>
                </div>
                <div className="space-y-4">
                  {attributesGenericSearch?.attributes?.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <p>No attributes added to this asset yet.</p>
                    </div>
                  ) : (
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Name
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Value
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributesGenericSearch?.attributes?.map(data => (
                          <tr
                            key={data.name}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-2 text-sm font-medium text-gray-800">
                              {data.name}
                            </td>
                            <td className="break-all p-2 text-sm text-gray-500">
                              {data.value?.startsWith('#asset') ? (
                                <Link
                                  to={getAssetDrawerLink({
                                    dns: data.value.split('#')[3],
                                    name: data.value.split('#')[2],
                                  })}
                                  className="text-blue-500 hover:underline"
                                >
                                  {data.value}
                                </Link>
                              ) : (
                                data.value
                              )}
                            </td>
                            <td className="p-2 text-sm text-gray-500">
                              {formatDate(data.updated)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Assets Section */}
          <div className="rounded-lg  bg-white p-8 transition-all hover:rounded-lg hover:shadow-md">
            <h3 className="mb-4 text-2xl font-semibold tracking-wide text-gray-900">
              <AssetsIcon className="mr-1 inline size-6 text-gray-800" />
              Related Assets
            </h3>
            {linkedHostnames.length === 0 && linkedIps.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No related assets found.</p>
                <p>This asset has no related hostnames or IPs.</p>
              </div>
            ) : (
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      DNS
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linkedHostnames.map(data => {
                    const containsRisks = openRiskDataset[data.dns];

                    return (
                      <tr
                        key={data.dns}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm font-medium text-blue-500">
                          <div className="flex flex-row items-center space-x-1">
                            {containsRisks && (
                              <Tooltip title="Contains open risks">
                                <RisksIcon className="size-4 text-red-500" />
                              </Tooltip>
                            )}
                            <Link
                              to={getAssetDrawerLink({
                                dns: data.name.split('#')[3],
                                name: data.name.split('#')[2],
                              })}
                              className="hover:underline"
                            >
                              {data.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {data.dns}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {AssetStatusLabel[data.status]}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {formatDate(data.updated)}
                        </td>
                      </tr>
                    );
                  })}
                  {linkedIps.map(data => {
                    const containsRisks = openRiskDataset[data.dns];

                    return (
                      <tr
                        key={data.dns}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm font-medium text-blue-500">
                          <div className="flex flex-row items-center space-x-1">
                            {containsRisks && (
                              <Tooltip title="Contains open risks">
                                <RisksIcon className="size-4 text-red-500" />
                              </Tooltip>
                            )}
                            <Link
                              to={getAssetDrawerLink({
                                dns: data.dns,
                                name: data.name,
                              })}
                              className="hover:underline"
                            >
                              {data.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {data.dns}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {AssetStatusLabel[data.status]}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {formatDate(data.updated)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* History Section */}
          <div className="rounded-lg  bg-white p-8 transition-all hover:rounded-lg hover:shadow-md">
            <h3 className="mb-4 text-2xl font-semibold tracking-wide text-gray-900">
              <HistoryIcon className="mr-1 inline size-6 text-gray-800" />
              History
            </h3>
            <Timeline
              items={history.map((item, index) => {
                const { title, updated } = getHistoryDiff(item);
                return {
                  title,
                  description: updated,
                  icon:
                    index === 0 ? (
                      <AssetsIcon className="size-4 text-gray-800" />
                    ) : undefined,
                };
              })}
            />
          </div>
        </div>
      </Loader>
    </Drawer>
  );
};
