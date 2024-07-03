import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IdentificationIcon } from '@heroicons/react/24/outline';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Drawer } from '@/components/Drawer';
import { HorizontalSplit } from '@/components/HorizontalSplit';
import { AssetsIcon } from '@/components/icons';
import { Loader } from '@/components/Loader';
import { OverflowText } from '@/components/OverflowText';
import { Table } from '@/components/table/Table';
import { AssetStatusText } from '@/components/ui/AssetStatusChip';
import { DetailsListContainer } from '@/components/ui/DetailsListContainer';
import { useMy } from '@/hooks';
import { useUpdateAsset } from '@/hooks/useAssets';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useIntegration } from '@/hooks/useIntegration';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { Asset, Risk } from '@/types';
import { formatDate } from '@/utils/date.util';
import { capitalize } from '@/utils/lodash.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

import { DRAWER_WIDTH } from '.';

interface Props {
  compositeKey: string;
  open: boolean;
}

const TABLE_LIMIT = 10;

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const [, dns, name] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const linkedIpsFilter = `#${dns}#`;
  const attributeFilter = `#${dns}#${name}`;

  const [assetsLimit, setAssetsLimit] = useState(TABLE_LIMIT);
  const [riskLimit, setRiskLimit] = useState(TABLE_LIMIT);

  const { getRiskDrawerLink, getAssetDrawerLink } = useOpenDrawer();
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

  const {
    assets: rawLinkedHostnamesIncludingSelf = [],
    attributes: genericAttributes = [],
  } = assetNameGenericSearch || {};

  // Note: Update class name for the following two variables to get assets and risks
  const associatedAssets = genericAttributes.filter(
    attribute => attribute.class === 'seed'
  ) as unknown as Asset[];

  const associatedRisks = genericAttributes.filter(
    attribute => attribute.class === 'seed'
  ) as unknown as Risk[];

  const showMoreAssets = associatedAssets.length > TABLE_LIMIT;
  const showMoreRisks = associatedRisks.length > TABLE_LIMIT;

  const seed = attributes.find(attribute => attribute.class === 'seed');
  const asset: Asset = assets[0] || {};

  const assetType = useGetAssetType(asset);

  const rawLinkedHostnames = rawLinkedHostnamesIncludingSelf.filter(
    ({ dns }) => dns !== asset.dns
  );
  const rawlinkedIps = rawlinkedIpsIncludingSelf.filter(
    ({ name }) => name !== asset.dns
  );

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
          <Button
            startIcon={<IdentificationIcon className="size-5" />}
            className="ml-auto hover:bg-layer0"
            styleType="secondary"
          >
            Attributes
          </Button>
        </Link>
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-[calc(100%-24px)] flex-col gap-8">
          <DetailsDrawerHeader
            title={asset.name}
            subtitle={
              assetType === 'seed'
                ? `${associatedRisks?.length} Risks Found`
                : asset.dns
            }
            prefix={<AssetsIcon className="size-5" />}
            tag={
              assetType === 'integration' && (
                <Chip>{capitalize(assetType)}</Chip>
              )
            }
          />
          <HorizontalSplit
            leftContainer={
              <>
                {['seed', 'integration'].includes(assetType) && (
                  <Accordian title="Associated Assets" contentClassName="pt-0">
                    <Table
                      tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                      name="Associated Assets"
                      status="success"
                      className="max-h-[550px]"
                      data={associatedAssets.slice(0, assetsLimit)}
                      columns={[
                        {
                          label: 'Name',
                          id: 'name',
                          className: 'w-full cursor-pointer pl-0',
                          cell: (item: Asset) => (
                            <div className="w-full font-medium text-brand">
                              <OverflowText
                                text={`${item.key.split('#')[3]} (${item.dns})`}
                              />
                            </div>
                          ),
                          copy: true,
                          to: item => {
                            return getAssetDrawerLink({
                              dns: item.dns,
                              name: item.key.split('#')[3],
                            });
                          },
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
                    {showMoreAssets && (
                      <div className="flex w-full">
                        <Button
                          className="ml-auto"
                          styleType="textPrimary"
                          onClick={() =>
                            setAssetsLimit(limit =>
                              limit === assets.length
                                ? TABLE_LIMIT
                                : assets.length
                            )
                          }
                        >
                          {assetsLimit === assets.length
                            ? 'View Less'
                            : `and ${assets.length - assetsLimit} more`}
                        </Button>
                      </div>
                    )}
                  </Accordian>
                )}
                {['seed', 'integration'].includes(assetType) && (
                  <Accordian title="Associated Risks" contentClassName="pt-0">
                    <Table
                      tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                      name="Associated Risks"
                      status="success"
                      data={associatedRisks.slice(0, riskLimit)}
                      columns={[
                        {
                          label: 'Name',
                          id: 'name',
                          className: 'w-full cursor-pointer pl-0',
                          cell: (item: Risk) => (
                            <div className="w-full font-medium text-brand">
                              <OverflowText
                                text={`${item.key.split('#')[3]}`}
                              />
                            </div>
                          ),
                          copy: true,
                          to: (item: Risk) => {
                            const dns = item.key.split('#')[2];
                            const name = item.key.split('#')[3];
                            return getRiskDrawerLink({ dns, name });
                          },
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
                    {showMoreRisks && (
                      <div className="flex w-full">
                        <Button
                          className="ml-auto"
                          styleType="textPrimary"
                          onClick={() =>
                            setRiskLimit(limit =>
                              limit === assets.length
                                ? TABLE_LIMIT
                                : assets.length
                            )
                          }
                        >
                          {assetsLimit === assets.length
                            ? 'View Less'
                            : `and ${assets.length - assetsLimit} more`}
                        </Button>
                      </div>
                    )}
                  </Accordian>
                )}
                {assetType === 'asset' && (
                  <Accordian
                    title="Associated Hostnames"
                    contentClassName="pt-0"
                  >
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
                )}
                {assetType === 'asset' && (
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
                )}
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
                      label: 'Discovered From',
                      value: seed?.name,
                      to: {
                        pathname: window.location.pathname,
                        search: `?${StorageKey.DRAWER_COMPOSITE_KEY}=${encodeURIComponent(`#asset#${seed?.name}#${seed?.name}`)}`,
                      },
                    },
                    ...(assetType === 'asset'
                      ? [
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
                        ]
                      : []),
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

function useGetAssetType(asset: Asset) {
  const { isIntegration } = useIntegration();

  return isIntegration(asset) ? 'integration' : asset.seed ? 'seed' : 'asset';
}
