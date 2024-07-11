import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Chip } from '@/components/Chip';
import { Drawer } from '@/components/Drawer';
import { AssetsIcon } from '@/components/icons';
import { Loader } from '@/components/Loader';
import { AssetStatusDropdown } from '@/components/ui/AssetPriorityDropdown';
import { TabWrapper } from '@/components/ui/TabWrapper';
import { useMy } from '@/hooks';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useIntegration } from '@/hooks/useIntegration';
import { getAttributeDetails } from '@/sections/Attributes';
import { DRAWER_WIDTH } from '@/sections/detailsDrawer';
import { AddAttribute } from '@/sections/detailsDrawer/AddAttribute';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { DrawerList } from '@/sections/detailsDrawer/DrawerList';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { getStatus } from '@/sections/RisksTable';
import { Asset, RiskStatus } from '@/types';
import { formatDate } from '@/utils/date.util';
import { capitalize } from '@/utils/lodash.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

interface Props {
  compositeKey: string;
  open: boolean;
}

export const AssetDrawer: React.FC<Props> = ({ compositeKey, open }: Props) => {
  const [, dns, name] = compositeKey.split('#');
  const riskFilter = `#${dns}`;
  const linkedIpsFilter = `#${dns}#`;
  const attributeFilter = `#asset#${dns}#${name}`;

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

  const associatedAssets = genericAttributes.filter(
    attribute =>
      attribute.class === 'seed' && attribute.key.startsWith('#attribute#asset')
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

  const isInitialLoading =
    assestsStatus === 'pending' ||
    risksStatus === 'pending' ||
    linkedIpsStatus === 'pending' ||
    attributesStatus === 'pending' ||
    assetNameGenericSearchStatus === 'pending';

  const isTypeAsset = assetType === 'asset';

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
            subtitle={assetType === 'seed' ? asset.username : asset.dns}
            prefix={<AssetsIcon className="size-5" />}
            tag={
              assetType === 'integration' && (
                <Chip>{capitalize(assetType)}</Chip>
              )
            }
          />
        )
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex justify-between px-8 pb-4 ">
          <AssetStatusDropdown asset={asset} />
          <div className="flex text-default-light">
            <EyeIcon className="mr-2 size-5" />
            {formatDate(asset.updated)}
          </div>
        </div>
        <TabGroup className="h-full">
          <TabList className="flex overflow-x-auto">
            {['Risks', 'Assets', 'Attributes'].map(tab => (
              <TabWrapper key={tab}>{tab}</TabWrapper>
            ))}
          </TabList>
          <TabPanels className="size-full h-[calc(100%-150px)] overflow-auto">
            <TabPanel className="h-full">
              <DrawerList
                items={openRisks.map(({ dns, name, updated }) => {
                  return {
                    label: dns,
                    value: name,
                    date: updated,
                    to: getDrawerLink().getRiskDrawerLink({ dns, name }),
                  };
                })}
              />
            </TabPanel>

            <TabPanel className="h-full">
              {!isTypeAsset && (
                <DrawerList
                  items={associatedAssets.map(data => {
                    const { name, dns, url } = getAttributeDetails(data);
                    return {
                      label: name,
                      value: dns,
                      date: data.updated,
                      to: url,
                    };
                  })}
                />
              )}
              {isTypeAsset && (
                <DrawerList
                  items={[
                    ...linkedHostnames.map(data => ({
                      label: data.name,
                      value: data.dns,
                      updated: data.updated,
                      to: getAssetDrawerLink(data),
                    })),
                    ...linkedIps.map(data => ({
                      label: data.dns,
                      value: data.name,
                      updated: data.updated,
                      to: getAssetDrawerLink(data),
                    })),
                  ]}
                />
              )}
            </TabPanel>
            <TabPanel className="h-full">
              <AddAttribute resourceKey={asset.key} />
              <div>
                <DrawerList
                  allowEmpty={true}
                  items={attributes.map(data => ({
                    label: data.class,
                    value: data.name,
                    updated: data.updated,
                  }))}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Loader>
    </Drawer>
  );
};

function useGetAssetType(asset: Asset) {
  const { isIntegration } = useIntegration();

  return isIntegration(asset) ? 'integration' : asset.seed ? 'seed' : 'asset';
}
