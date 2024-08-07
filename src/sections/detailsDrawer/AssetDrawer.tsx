import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Chip } from '@/components/Chip';
import { Drawer } from '@/components/Drawer';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { getAssetStatusIcon } from '@/components/icons/AssetStatus.icon';
import { getRiskSeverityIcon } from '@/components/icons/RiskSeverity.icon';
import { getRiskStatusIcon } from '@/components/icons/RiskStatus.icon';
import { Loader } from '@/components/Loader';
import { Timeline } from '@/components/Timeline';
import { Tooltip } from '@/components/Tooltip';
import { AssetStatusDropdown } from '@/components/ui/AssetPriorityDropdown';
import { getAssetStatusProperties } from '@/components/ui/AssetStatusChip';
import { NoData } from '@/components/ui/NoData';
import { TabWrapper } from '@/components/ui/TabWrapper';
import { useMy } from '@/hooks';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useIntegration } from '@/hooks/useIntegration';
import { buildOpenRiskDataset } from '@/sections/Assets';
import { DRAWER_WIDTH } from '@/sections/detailsDrawer';
import { AddAttribute } from '@/sections/detailsDrawer/AddAttribute';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { DrawerList } from '@/sections/detailsDrawer/DrawerList';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { getStatus } from '@/sections/RisksTable';
import {
  Asset,
  AssetStatusLabel,
  EntityHistory,
  Risk,
  RiskSeverity,
  RiskStatus,
  RiskStatusLabel,
  SeverityDef,
} from '@/types';
import { formatDate } from '@/utils/date.util';
import { capitalize } from '@/utils/lodash.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

interface Props {
  compositeKey: string;
  open: boolean;
}

function getHistoryDiff(history: EntityHistory): {
  title: ReactNode;
  updated: string;
} {
  if (history.from === '') {
    return {
      title: (
        <div className="whitespace-break-spaces">
          <p className="inline">
            <strong>First Tracked</strong> as{' '}
          </p>
          <p className="inline">
            <strong>
              {AssetStatusLabel[history.to as keyof typeof AssetStatusLabel]}
            </strong>
          </p>
        </div>
      ),
      updated: formatDate(history.updated),
    };
  } else {
    return {
      title: (
        <div className="whitespace-break-spaces">
          <p className="inline">
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
          </p>
          <p className="inline">
            <strong>
              {AssetStatusLabel[history.from as keyof typeof AssetStatusLabel]}
            </strong>{' '}
            to{' '}
            <strong>
              {AssetStatusLabel[history.to as keyof typeof AssetStatusLabel]}
            </strong>
          </p>
        </div>
      ),
      updated: formatDate(history.updated),
    };
  }
}

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const [, dns, name] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const linkedIpsFilter = `#${dns}#`;
  const attributeFilter = `source:#asset${compositeKey}`;

  const { getAssetDrawerLink } = getDrawerLink();
  const { removeSearchParams } = useSearchParams();
  const navigate = useNavigate();

  const { data: assets = [], status: assestsStatus } = useMy(
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
  const { data: rawlinkedIpsIncludingSelf = [], status: linkedIpsStatus } =
    useMy(
      {
        resource: 'asset',
        query: linkedIpsFilter,
      },
      { enabled: open }
    );
  const { data: assetNameGenericSearch, status: assetNameGenericSearchStatus } =
    useGenericSearch({ query: name }, { enabled: open });

  const { assets: rawLinkedHostnamesIncludingSelf = [] } =
    assetNameGenericSearch || {};

  const openRiskDataset = useMemo(
    () => buildOpenRiskDataset(risks as Risk[]),
    [risks]
  );

  const asset: Asset = assets[0] || {};

  const assetType = useGetAssetType(asset);

  const linkedHostnames = rawLinkedHostnamesIncludingSelf.filter(
    ({ dns }) => dns !== asset.dns
  );
  const linkedIps = rawlinkedIpsIncludingSelf.filter(
    ({ name }) => name !== asset.dns
  );

  const openRisks = risks.filter(
    ({ status }) => getStatus(status) === RiskStatus.Opened
  );

  const history = useMemo(() => {
    const assetHistory = asset.history || [];
    const noHistory = assetHistory.length === 0;

    const firstTrackedHistory: EntityHistory = {
      from: '',
      to: noHistory ? asset.status : asset.history[0].from,
      updated: asset.created,
    };

    return [firstTrackedHistory, ...assetHistory];
  }, [JSON.stringify(asset.history)]);

  const isInitialLoading =
    assestsStatus === 'pending' ||
    risksStatus === 'pending' ||
    linkedIpsStatus === 'pending' ||
    attributesStatus === 'pending' ||
    assetNameGenericSearchStatus === 'pending';

  return (
    <Drawer
      open={open}
      onClose={() => removeSearchParams(StorageKey.DRAWER_COMPOSITE_KEY)}
      onBack={() => navigate(-1)}
      minWidth={DRAWER_WIDTH}
      header={
        isInitialLoading ? null : (
          <DetailsDrawerHeader
            title={asset.name}
            subtitle={asset.dns}
            prefix={<AssetsIcon className="size-5" />}
            tag={
              <div className="flex justify-center text-sm text-gray-400">
                {assetType === 'integration' && (
                  <Chip>{capitalize(assetType)}</Chip>
                )}
                <EyeIcon className="mr-2 size-5" />
                {formatDate(asset.updated)}
              </div>
            }
          />
        )
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="mb-2 flex justify-between border border-gray-100 bg-gray-50 px-8 py-3">
          <Tooltip placement="top" title="Change scan status">
            <div>
              <AssetStatusDropdown asset={asset} />
            </div>
          </Tooltip>
        </div>
        <TabGroup className="h-full">
          <TabList className="flex overflow-x-auto">
            {['Risks', 'Attributes', 'Related Assets', 'History'].map(tab => (
              <TabWrapper key={tab}>{tab}</TabWrapper>
            ))}
          </TabList>
          <TabPanels className="size-full h-[calc(100%-150px)] overflow-auto">
            <TabPanel className="h-full">
              <DrawerList
                noDataMessage={
                  <NoData
                    title={'No Risks Found'}
                    description={
                      "Congratulations! Your Asset look safe, secure, and properly configured.\nWe'll continue to watch it to ensure nothing changes."
                    }
                  />
                }
                dns={asset.dns}
                items={openRisks.map(({ dns, name, status, updated }) => {
                  const riskStatusKey =
                    `${status?.[0]}${status?.[2] || ''}` as RiskStatus;
                  const riskSeverityKey = status?.[1] as RiskSeverity;

                  const statusIcon = getRiskStatusIcon(riskStatusKey, 'size-5');
                  const severityIcon = getRiskSeverityIcon(
                    riskSeverityKey,
                    'size-5'
                  );

                  const icons = (
                    <div className="flex items-center gap-2 text-black">
                      <Tooltip
                        title={
                          (RiskStatusLabel[riskStatusKey] || 'Closed') +
                          ' Status'
                        }
                      >
                        {statusIcon}
                      </Tooltip>
                      <Tooltip
                        title={SeverityDef[riskSeverityKey] + ' Severity'}
                      >
                        {severityIcon}
                      </Tooltip>
                    </div>
                  );

                  return {
                    prefix: icons,
                    label: dns,
                    value: name,
                    updated: updated,
                    to: getDrawerLink().getRiskDrawerLink({ dns, name }),
                  };
                })}
              />
            </TabPanel>
            <TabPanel className="h-full">
              <div className="ml-4">
                <AddAttribute resourceKey={asset.key} />
              </div>
              <div>
                <DrawerList
                  allowEmpty={true}
                  dns={asset.dns}
                  items={(attributesGenericSearch?.attributes || [])?.map(
                    data => ({
                      label: data.name,
                      value: data.value,
                      updated: data.updated,
                    })
                  )}
                />
              </div>
            </TabPanel>
            <TabPanel className="h-full">
              <DrawerList
                dns={asset.dns}
                items={[
                  ...linkedHostnames.map(data => {
                    const { detail } = getAssetStatusProperties(data.status);
                    const containsRisks = openRiskDataset[data.dns];

                    const icons = [
                      <Tooltip key="status" title={detail}>
                        {getAssetStatusIcon(data.status, 'size-5')}
                      </Tooltip>,
                    ];

                    if (containsRisks) {
                      icons.push(
                        <Tooltip key="risks" title="Contains open risks">
                          <div>
                            <RisksIcon className="size-5" />
                          </div>
                        </Tooltip>
                      );
                    }

                    return {
                      prefix: (
                        <div className="flex flex-row space-x-2">{icons}</div>
                      ),
                      label: data.name,
                      value: data.dns,
                      updated: data.updated,
                      to: getAssetDrawerLink(data),
                    };
                  }),
                  ...linkedIps.map(data => {
                    const { detail } = getAssetStatusProperties(data.status);
                    const containsRisks = openRiskDataset[data.dns];

                    const icons = [
                      <Tooltip key="status" title={detail + ' Status'}>
                        {getAssetStatusIcon(data.status, 'size-5')}
                      </Tooltip>,
                    ];

                    if (containsRisks) {
                      icons.push(
                        <Tooltip key="risks" title="Contains Open Risks">
                          <div>
                            <RisksIcon className="size-5" />
                          </div>
                        </Tooltip>
                      );
                    }
                    return {
                      prefix: (
                        <div className="flex flex-row items-center gap-1">
                          {icons}
                        </div>
                      ),
                      label: data.dns,
                      value: data.name,
                      updated: data.updated,
                      to: getAssetDrawerLink(data),
                    };
                  }),
                ]}
              />
            </TabPanel>
            <TabPanel className="h-full px-6">
              <Timeline
                items={[
                  ...(history
                    ?.map((item, itemIndex) => {
                      const { title, updated } = getHistoryDiff(item);
                      return {
                        title,
                        description: updated,
                        icon:
                          itemIndex === 0 ? (
                            <AssetsIcon className="stroke-1" />
                          ) : undefined,
                      };
                    })
                    .reverse() || []),
                ]}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Loader>
    </Drawer>
  );
};

function useGetAssetType(asset: Asset) {
  const { isIntegration } = useIntegration();

  return isIntegration(asset) ? 'integration' : 'asset';
}
