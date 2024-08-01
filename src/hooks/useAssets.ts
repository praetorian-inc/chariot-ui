import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { Asset, AssetStatus, AssetStatusLabel, RiskScanMessage } from '@/types';
import { useMutation } from '@/utils/api';

interface UpdateAssetProps {
  key: string;
  name: string;
  status?: AssetStatus;
  comment?: string;
  showSnackbar?: boolean;
}

export const AssetsSnackbarTitle = {
  [AssetStatus.Active]: `will be marked as ${AssetStatusLabel[AssetStatus.Active].toLocaleLowerCase()}`,
  [AssetStatus.ActiveHigh]: `will be marked as ${AssetStatusLabel[AssetStatus.ActiveHigh].toLocaleLowerCase()}`,
  [AssetStatus.ActiveLow]: `will be marked as ${AssetStatusLabel[AssetStatus.ActiveLow].toLocaleLowerCase()}`,
  [AssetStatus.Frozen]: 'will stop scanning',
  [AssetStatus.Deleted]: 'will stop scanning',
};

export const getStartMessage = (status: AssetStatus) => {
  if (status === AssetStatus.Frozen) {
    return RiskScanMessage.Stop;
  }

  if (status === AssetStatus.ActiveHigh) {
    return RiskScanMessage.StartHigh;
  } else if (status === AssetStatus.ActiveLow) {
    return RiskScanMessage.StartLow;
  } else if (status === AssetStatus.Active) {
    return RiskScanMessage.Start;
  } else {
    return '';
  }
};

export const useUpdateAsset = () => {
  const axios = useAxios();

  const { updateAllSubQueries } = useMy(
    {
      resource: 'asset',
    },
    {
      enabled: false,
    }
  );

  return useMutation<Asset, Error, UpdateAssetProps>({
    defaultErrorMessage: 'Failed to update asset',
    mutationFn: async ({ key, name, status, comment }) => {
      const promise = axios.put(`/asset`, {
        key,
        status,
        comment,
      });

      toast.promise(promise, {
        loading: `Updating ${name}`,
        success: `Updated ${name}`,
        error: `Failed to update ${name}`,
      });

      const response = await promise;
      const data = response.data?.[0] as Asset;

      updateAllSubQueries(previous => {
        if (!previous) {
          return { pages: [[data]], pageParams: [undefined] };
        }
        const updatedPages = previous.pages.map(page =>
          page.map(currentAsset =>
            currentAsset.key === key ? data : currentAsset
          )
        );
        return { ...previous, pages: updatedPages };
      });

      return data;
    },
  });
};

export function mapAssetStataus(asset: Asset) {
  if ([AssetStatus.ActiveHigh, AssetStatus.ActiveLow].includes(asset.status)) {
    return asset.status;
  }

  if ((asset.status as string) === 'AS') {
    return AssetStatus.Active;
  }

  return asset.status as AssetStatus;
}

export const useCreateAsset = () => {
  const axios = useAxios();
  const { invalidate: invalidateJob } = useMy(
    { resource: 'job' },
    { enabled: false }
  );
  const { invalidate: invalidateAssets } = useMy(
    { resource: 'asset' },
    { enabled: false }
  );

  return useMutation<Asset, Error, Pick<Asset, 'name' | 'status'>>({
    defaultErrorMessage: `Failed to add asset`,
    mutationFn: async asset => {
      const promise = axios.post(`/asset`, {
        dns: asset.name,
        name: asset.name,
        status: asset.status || AssetStatus.Active,
      });

      toast.promise(promise, {
        loading: 'Adding asset',
        success: `Added ${asset.name}`,
        error: 'Failed to add asset',
      });

      const { data } = await promise;

      invalidateJob();
      invalidateAssets();

      return data;
    },
  });
};

export const useBulkAddAsset = () => {
  const axios = useAxios();
  const { invalidate: invalidateJob } = useMy(
    { resource: 'job' },
    { enabled: false }
  );
  const { invalidate: invalidateAsset } = useMy(
    { resource: 'asset' },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: 'Failed to bulk add assets',
    errorByStatusCode: {
      402: 'License is required to add more assets',
    },
    mutationFn: async (
      assets: (Partial<Pick<Asset, 'status'>> & Pick<Asset, 'name'>)[]
    ) => {
      const promise = Promise.all<Asset>(
        assets
          .map(async asset => {
            const { data } = await axios.post<Asset[]>(`/asset`, {
              dns: asset.name,
              name: asset.name,
              status: asset.status || AssetStatus.Active,
            });

            return data[0];
          })
          // Note: Catch error so we can continue adding assets even if some fail
          .map(p => p.catch(e => e))
      );

      toast.promise(promise, {
        loading: 'Adding assets',
        success: `Added ${assets.length} assets`,
        error: 'Failed to add assets',
      });

      const response = await promise;

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        invalidateJob();
        invalidateAsset();
      }

      return validResults;
    },
  });
};
