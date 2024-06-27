import { Link, useNavigate } from 'react-router-dom';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { HorizontalSplit } from '@/components/HorizontalSplit';
import { AssetsIcon } from '@/components/icons';
import { Loader } from '@/components/Loader';
import { Table } from '@/components/table/Table';
import { AssetStatusText } from '@/components/ui/AssetStatusChip';
import { DetailsListContainer } from '@/components/ui/DetailsListContainer';
import { useMy } from '@/hooks';
import { useUpdateAsset } from '@/hooks/useAssets';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { Asset } from '@/types';
import { formatDate } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

import { DRAWER_WIDTH } from '.';

interface Props {
  compositeKey: string;
  open: boolean;
}

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const [, dns, name] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const linkedIpsFilter = `#${dns}#`;
  const attributeFilter = `#${dns}#${name}`;

  const { getAssetDrawerLink } = useOpenDrawer();
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
      className={DRAWER_WIDTH}
      footer={
        <Link
          to={{
            pathname: getRoute(['app', 'attributes']),
            search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(attributeFilter)}`,
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
            title={asset.name}
            subtitle={asset.dns}
            prefix={<AssetsIcon className="size-5" />}
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
                        copy: true,
                        to: item => getAssetDrawerLink(item),
                      },
                      {
                        label: 'Last Seen',
                        id: 'updated',
                        cell: 'date',
                      },
                    ]}
                    error={null}
                    isTableView={false}
                  />
                  {hasMorelinkedHostnames > 0 && (
                    <div className="flex w-full">
                      <Link
                        className="ml-auto"
                        to={{
                          pathname: getRoute(['app', 'assets']),
                          search: `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(name)}`,
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
                        to: item => getAssetDrawerLink(item),
                      },
                      {
                        label: 'Last Seen',
                        id: 'updated',
                        cell: 'date',
                      },
                    ]}
                    error={null}
                    isTableView={false}
                  />
                  {hasMoreLinkedIps > 0 && (
                    <div className="flex w-full">
                      <Link
                        className="ml-auto"
                        to={{
                          pathname: getRoute(['app', 'assets']),
                          search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(linkedIpsFilter)}`,
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
                      label: 'Status',
                      value: (
                        <AssetStatusText
                          status={asset.status}
                          showIcon={false}
                        />
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
                              search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(riskFilter)}`,
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
