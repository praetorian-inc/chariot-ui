import { AssetDrawer } from '@/sections/detailsDrawer/AssetDrawer';
import { RiskDrawer } from '@/sections/detailsDrawer/RiskDrawer';
import { SeedDrawer } from '@/sections/detailsDrawer/SeedDrawer';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

export const DRAWER_WIDTH = 'w-[864px]';

export const DetailsDrawer = () => {
  const { searchParams } = useSearchParams();
  const key = searchParams.get(StorageKey.DRAWER_COMPOSITE_KEY) ?? '';
  const [, drawerType, ...rest] = key.split('#');
  const compositeKey = `#${rest.join('#')}`;

  return (
    <div id="details-id">
      <SeedDrawer open={drawerType === 'seed'} compositeKey={compositeKey} />
      <AssetDrawer open={drawerType === 'asset'} compositeKey={compositeKey} />
      <RiskDrawer open={drawerType === 'risk'} compositeKey={compositeKey} />
    </div>
  );
};
