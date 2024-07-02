import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { Asset, AssetStatus, RiskScanMessage } from '@/types';
import { useMutation } from '@/utils/api';

interface UpdateAssetProps {
  key: string;
  name: string;
  status?: AssetStatus;
  comment?: string;
  showSnackbar?: boolean;
}

export const AssetsSnackbarTitle = {
  [AssetStatus.Unknown]: 'will be marked as unknown',
  [AssetStatus.Active]: 'will resume scanning',
  [AssetStatus.ActiveHigh]: 'will be marked as high priority',
  [AssetStatus.Frozen]: 'will be removed',
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
          description:
            status === AssetStatus.Frozen || status === AssetStatus.Unknown
              ? RiskScanMessage.Stop
              : RiskScanMessage.Start,
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
  if (asset.status === AssetStatus.ActiveHigh) {
    return asset.status;
  }
  return (
    asset.status.length === 1 ? asset.status : asset.status[1]
  ) as AssetStatus;
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

  return useMutation<Asset, Error, Pick<Asset, 'name' | 'seed'>>({
    defaultErrorMessage: `Failed to add seed`,
    mutationFn: async asset => {
      const { data } = await axios.post(`/asset`, {
        dns: asset.name,
        name: asset.name,
        seed: asset.seed,
        status: AssetStatus.Active,
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
