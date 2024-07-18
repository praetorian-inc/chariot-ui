import { Snackbar } from '@/components/Snackbar';
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
    mutationFn: async ({ key, name, status, comment, showSnackbar = true }) => {
      const response = await axios.put(`/asset`, {
        key,
        status,
        comment,
      });

      const data = response.data?.[0] as Asset;

      if (status && showSnackbar) {
        Snackbar({
          title: `${name} ${AssetsSnackbarTitle[status]}`,
          description: getStartMessage(status),
          variant: 'success',
        });
      }

      if (comment && showSnackbar) {
        Snackbar({
          title: `${name} comment updated`,
          description: '',
          variant: 'success',
        });
      }

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
      const { data } = await axios.post(`/asset`, {
        dns: asset.name,
        name: asset.name,
        status: asset.status || AssetStatus.Active,
      });

      Snackbar({
        title: `${asset.name} added`,
        description: '',
        variant: 'success',
      });

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

  return useMutation<void, Error, string[]>({
    defaultErrorMessage: 'Failed to bulk add assets',
    errorByStatusCode: {
      402: 'License is required to add more assets',
    },
    mutationFn: async (assets: string[]) => {
      const response = await Promise.all(
        assets
          .map(async asset => {
            await axios.post(`/asset`, {
              dns: asset,
              status: AssetStatus.Active,
            });
          })
          // Note: Catch error so we can continue adding assets even if some fail
          .map(p => p.catch(e => e))
      );

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        Snackbar({
          title: `Added ${validResults.length} assets`,
          description: getStartMessage(AssetStatus.Active),
          variant: 'success',
        });

        invalidateJob();
        invalidateAsset();
      }

      if (validResults.length !== assets.length) {
        const firstError = response.find(result => result instanceof Error);
        // Note: Some assets failed to add, so throwing the first error, and useMutation will handle the error toast

        throw firstError;
      }

      return;
    },
  });
};
