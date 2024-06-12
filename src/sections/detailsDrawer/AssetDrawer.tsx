import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { HorizontalSplit } from '@/components/HorizontalSplit';
import { Loader } from '@/components/Loader';
import { Table } from '@/components/table/Table';
import { Tooltip } from '@/components/Tooltip';
import { AssetStatusChip } from '@/components/ui/AssetStatusChip';
import { DetailsListContainer } from '@/components/ui/DetailsListContainer';
import { useMy } from '@/hooks';
import { useUpdateAsset } from '@/hooks/useAssets';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useSearchParams } from '@/hooks/useSearchParams';
import { formatDate } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';

import { Asset, AssetStatus } from '../../types';

import { Comment } from './Comment';
import { DetailsDrawerHeader } from './DetailsDrawerHeader';
import { useOpenDrawer } from './useOpenDrawer';

interface Props {
  compositeKey: string;
  open: boolean;
}

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const [, dns, name] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const linkedIpsFilter = `#${dns}#`;
  const attributeFilter = `#${dns}#${name}`;

  const { openAsset } = useOpenDrawer();
  const { removeSearchParams } = useSearchParams();
  const navigate = useNavigate();

  const { mutateAsync: updateAsset } = useUpdateAsset();

  const { data: assets = [], status: assestsStatus } = useMy(
    {
      resource: 'asset',
      query: compositeKey,
    },
    { enabled: open }
  );
  const { data: attributes = [], status: attributesStatus } = useMy(
    {
      resource: 'attribute',
      query: attributeFilter,
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

  const seed = attributes.find(attribute => attribute.class === 'seed');
  const asset: Asset = assets[0] || {};

  const rawLinkedHostnames = rawLinkedHostnamesIncludingSelf;
  const rawlinkedIps = rawlinkedIpsIncludingSelf;

  const linkedHostnames = rawLinkedHostnames.slice(0, 10);
  const linkedIps = rawlinkedIps.slice(0, 10);

  const rawLinkedHostnamesLength = rawLinkedHostnames.length;
  const rawlinkedIpsLength = rawlinkedIps.length;

  const hasMorelinkedHostnames =
    rawLinkedHostnamesLength > 10 ? rawLinkedHostnamesLength - 10 : 0;
  const hasMoreLinkedIps =
    rawlinkedIpsLength > 10 ? rawlinkedIpsLength - 10 : 0;

  async function handleUpdateDescription(description = '') {
    await updateAsset({
      key: asset.key,
      comment: description,
      name: asset.name,
    });
  }

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
      className={'w-[864px]'}
      footer={
        <Link
          to={{
            pathname: getRoute(['app', 'attributes']),
            search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(attributeFilter)}&${StorageKey.FORCE_UPDATE_GLOBAL_SEARCH}=true`,
          }}
        >
          <Button className="ml-auto hover:bg-layer0" styleType="secondary">
            Show Attributes
          </Button>
        </Link>
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-[calc(100%-24px)] flex-col gap-8">
          <DetailsDrawerHeader
            prefix={
              asset.status === AssetStatus.ActiveHigh && (
                <Tooltip title="High Priority Asset" placement="left">
                  <ArrowUpCircleIcon className="size-5 text-brand" />
                </Tooltip>
              )
            }
            title={asset.name}
            subtitle={asset.dns}
          />
          <HorizontalSplit
            leftContainer={
              <>
                <Accordian title="Associated Hostnames" contentClassName="pt-0">
                  <Table
                    tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                    name="Associated Hostnames"
                    status="success"
                    data={linkedHostnames}
                    columns={[
                      {
                        label: 'DNS',
                        id: 'dns',
                        className: 'w-full cursor-pointer pl-0',
                        cell: 'highlight',
                        onClick: (item: Asset) => openAsset(item),
                      },
                      {
                        label: 'Last Seen',
                        id: 'updated',
                        cell: 'date',
                      },
                    ]}
                    error={null}
                    header={false}
                    footer={false}
                  />
                  {hasMorelinkedHostnames > 0 && (
                    <div className="flex w-full">
                      <Link
                        className="ml-auto"
                        to={{
                          pathname: getRoute(['app', 'assets']),
                          search: `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(name)}&${StorageKey.FORCE_UPDATE_GLOBAL_SEARCH}=true`,
                        }}
                      >
                        <Button styleType="textPrimary">
                          and {hasMorelinkedHostnames} more
                        </Button>
                      </Link>
                    </div>
                  )}
                </Accordian>
                <Accordian
                  title="Associated IP Addresses"
                  contentClassName="pt-0"
                >
                  <Table
                    tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                    name="Associated IP Addresses"
                    status="success"
                    data={linkedIps}
                    columns={[
                      {
                        label: 'IP Address',
                        id: 'name',
                        className: 'w-full cursor-pointer pl-0',
                        cell: 'highlight',
                        onClick: (item: Asset) => openAsset(item),
                      },
                      {
                        label: 'Last Seen',
                        id: 'updated',
                        cell: 'date',
                      },
                    ]}
                    error={null}
                    header={false}
                    footer={false}
                  />
                  {hasMoreLinkedIps > 0 && (
                    <div className="flex w-full">
                      <Link
                        className="ml-auto"
                        to={{
                          pathname: getRoute(['app', 'assets']),
                          search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(linkedIpsFilter)}&${StorageKey.FORCE_UPDATE_GLOBAL_SEARCH}=true`,
                        }}
                      >
                        and {hasMoreLinkedIps} more
                      </Link>
                    </div>
                  )}
                </Accordian>
              </>
            }
            rightContainer={
              <>
                <DetailsListContainer
                  title="Asset Details"
                  list={[
                    {
                      label: '',
                      value: (
                        <div className="flex gap-2 text-sm">
                          <AssetStatusChip
                            className="p-2"
                            status={asset.status}
                          />
                        </div>
                      ),
                    },
                    {
                      label: 'First Seen',
                      value: formatDate(asset.created),
                      tooltip: asset.created,
                    },
                    {
                      label: 'Last Seen',
                      value: formatDate(asset.updated),
                      tooltip: asset.updated,
                    },
                    {
                      label: 'Seed',
                      value: seed?.name,
                      to: {
                        pathname: window.location.pathname,
                        search: `?${StorageKey.DRAWER_COMPOSITE_KEY}=${encodeURIComponent(`#seed#${seed?.name}`)}`,
                      },
                    },
                    {
                      label: 'Found Risks',
                      value: risks.length.toString(),
                      to:
                        risks.length > 0
                          ? {
                              pathname: getRoute(['app', 'risks']),
                              search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(riskFilter)}&${StorageKey.FORCE_UPDATE_GLOBAL_SEARCH}=true`,
                            }
                          : undefined,
                    },
                  ]}
                />
                <Comment
                  comment={asset.comment}
                  isLoading={false}
                  onSave={handleUpdateDescription}
                />
              </>
            }
          />
        </div>
      </Loader>
    </Drawer>
  );
};
