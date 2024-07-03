import { To } from 'react-router-dom';

import { Asset, Risk, Seed } from '@/types';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch } from '@/utils/url.util';

export function useOpenDrawer() {
  return {
    getAssetDrawerLink: (asset: Pick<Asset, 'dns' | 'name'>): To => {
      return generatePathWithSearch({
        appendSearch: [
          [
            StorageKey.DRAWER_COMPOSITE_KEY,
            `#asset#${asset.dns}#${asset.name}`,
          ],
        ],
      });
    },
    getRiskDrawerLink: (risk: Pick<Risk, 'dns' | 'name'>): To => {
      return generatePathWithSearch({
        appendSearch: [
          [StorageKey.DRAWER_COMPOSITE_KEY, `#risk#${risk.dns}#${risk.name}`],
        ],
      });
    },
    getProofOfExploitLink: (risk: Pick<Risk, 'dns' | 'name'>): To => {
      return generatePathWithSearch({
        appendSearch: [[StorageKey.POE, `${risk.dns}/${risk.name}`]],
      });
    },
    getSeedDrawerLink: (seed: Pick<Seed, 'name'>): To => {
      return generatePathWithSearch({
        appendSearch: [
          [StorageKey.DRAWER_COMPOSITE_KEY, `#seed#${seed.name}#${seed.name}`],
        ],
      });
    },
  };
}
