import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Drawer } from '@/components/Drawer';
import { HorizontalSplit } from '@/components/HorizontalSplit';
import { Loader } from '@/components/Loader';
import { OverflowText } from '@/components/OverflowText';
import { Table } from '@/components/table/Table';
import { DetailsListContainer } from '@/components/ui/DetailsListContainer';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { change as changeSeed } from '@/hooks/useSeeds';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { Asset, Attribute, Risk, Seed, SeedStatus } from '@/types';
import { formatDate } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

import { DRAWER_WIDTH } from '.';

interface Props {
  compositeKey: string;
  open: boolean;
}

const TABLE_LIMIT = 10;

export const SeedDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const { getRiskDrawerLink, getAssetDrawerLink } = useOpenDrawer();
  const {
    data: seedObj,
    isLoading,
    isFetching,
    refetch,
  } = useGenericSearch(
    {
      query: compositeKey.replace('#', ''),
    },
    {
      enabled: open,
    }
  );
  const { mutateAsync: updateSeed } = changeSeed();
  const { seeds = [], refs = [], attributes = [] } = seedObj || {};
  const seed: Seed = seeds[0] || {};
  const assets = attributes.filter(
    (attribute: Attribute) => attribute.class === 'seed'
  ) as unknown as Asset[];
  const { removeSearchParams } = useSearchParams();
  const navigate = useNavigate();
  const [assetsLimit, setAssetsLimit] = useState(TABLE_LIMIT);
  const showMoreAssets = assets.length > TABLE_LIMIT;

  async function handleUpdateDescription(comment = '') {
    await updateSeed({ key: seed.key, comment });
    refetch();
  }

  const seedDetails = useMemo(
    () => [
      {
        label: '',
        value: (
          <div className="flex gap-2 text-sm">
            <Chip
              className="p-2"
              style={
                seed?.status?.[0] === SeedStatus.Active
                  ? 'primary'
                  : seed?.status?.[0] === SeedStatus.Frozen
                    ? 'error'
                    : 'default'
              }
            >
              {seed?.status?.[0] === SeedStatus.Active
                ? 'Active'
                : seed?.status?.[0] === SeedStatus.Frozen
                  ? 'Frozen'
                  : 'Unknown'}
            </Chip>
          </div>
        ),
      },
      {
        label: 'Added',
        value: formatDate(seed.updated),
        tooltip: seed.updated,
      },
      ...(
        attributes?.filter(
          (attribute: Attribute) =>
            !Number.isNaN(Number.parseInt(attribute.name)) &&
            attribute.class?.toLowerCase() !== 'seed' // not useful information to the user
        ) || []
      ).map((attribute: Attribute) => {
        const isDate =
          attribute.class === 'expiration' || attribute.class === 'purchased';
        return {
          label:
            attribute.class.charAt(0).toUpperCase() + attribute.class.slice(1),
          value: isDate ? formatDate(attribute.name) : attribute.name,
          tooltip: isDate ? attribute.name : '',
        };
      }),
    ],
    [seed, attributes]
  );

  const risks = refs as unknown as Risk[];

  return (
    <Drawer
      open={open}
      onClose={() => removeSearchParams(StorageKey.DRAWER_COMPOSITE_KEY)}
      onBack={() => navigate(-1)}
      className={DRAWER_WIDTH}
    >
      <Loader isLoading={isLoading} type="spinner">
        <div className="flex h-[calc(100%-24px)] flex-col gap-8">
          <DetailsDrawerHeader
            title={seed.name}
            subtitle={isLoading ? '' : `${refs?.length} Risks Found`}
            isLoading={isLoading}
          />

          <HorizontalSplit
            leftContainer={
              <>
                <Accordian title="Associated Assets" contentClassName="pt-0">
                  <Table
                    tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                    name="Associated Assets"
                    status="success"
                    className="max-h-[550px]"
                    data={assets.slice(0, assetsLimit)}
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
                    header={false}
                    footer={false}
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

                <Accordian title="Associated Risks" contentClassName="pt-0">
                  <Table
                    tableClassName="border-none p-0 shadow-none [&_.th-top-border]:hidden"
                    name="Associated Risks"
                    status="success"
                    data={risks.slice(0, TABLE_LIMIT)}
                    columns={[
                      {
                        label: 'Name',
                        id: 'name',
                        className: 'w-full cursor-pointer pl-0',
                        cell: (item: Risk) => (
                          <div className="w-full font-medium text-brand">
                            <OverflowText text={`${item.key.split('#')[3]}`} />
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
                    header={false}
                    footer={false}
                  />
                  {risks.length - TABLE_LIMIT > 0 && (
                    <div className="flex w-full">
                      <Link
                        className="ml-auto"
                        to={{
                          pathname: getRoute(['app', 'risks']),
                          search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(`#${seed.name}`)}`,
                        }}
                      >
                        <Button styleType="textPrimary">
                          and {risks.length - TABLE_LIMIT} more
                        </Button>
                      </Link>
                    </div>
                  )}
                </Accordian>
              </>
            }
            rightContainer={
              <>
                <DetailsListContainer title="Seed Details" list={seedDetails} />
                <Comment
                  comment={seed.comment}
                  isLoading={isFetching}
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
