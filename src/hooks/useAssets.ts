import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { useAssetsWithAttributes } from '@/hooks/useAttribute';
import { useAxios } from '@/hooks/useAxios';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useMy } from '@/hooks/useMy';
import { buildOpenRiskDataset } from '@/sections/Assets';
import { parseKeys } from '@/sections/SearchByType';
import {
  Asset,
  AssetFilters,
  AssetStatus,
  AssetStatusLabel,
  AssetsWithRisk,
  Risk,
  RiskScanMessage,
} from '@/types';
import { useMutation } from '@/utils/api';
import { useMergeStatus } from '@/utils/api';

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

interface GetAssetProps {
  filters: AssetFilters;
}

export function useGetAssets(props: GetAssetProps) {
  const { filters } = props;

  const [isFilteredDataFetching, setIsFilteredDataFetching] = useState(false);

  const [debouncedSearch] = useDebounce(filters.search, 500);
  const isSearched = Boolean(filters.search);

  const {
    data: assetSearchByName,
    status: assetByNameStatus,
    error: assetSearchByNameError,
    isFetching: isFetchingAssetSearchByName,
  } = useGenericSearch(
    { query: `name:${debouncedSearch}` },
    { enabled: isSearched }
  );
  const {
    data: assetSearchByDns,
    status: assetSearchByDnsStatus,
    error: assetSearchByDnsError,
    isFetching: isFetchingAssetSearchByDns,
  } = useGenericSearch(
    { query: `dns:${debouncedSearch}` },
    { enabled: isSearched }
  );

  const {
    status: myAssetsStatus,
    data: myAssets = [],
    isFetching: isFetchingMyAssets,
    fetchNextPage: myAssetsFetchNextPage,
    isFetchingNextPage: myAssetsIsFetchingNextPage,
    error: myAssetsError,
  } = useMy(
    {
      resource: 'asset',
      filterByGlobalSearch: true,
    },
    { enabled: !isSearched }
  );

  const {
    data: risks = [],
    status: riskStatus,
    error: risksError,
    isFetching: isFetchingRisks,
  } = useMy({ resource: 'risk' });

  const attFilterKeys = useMemo(() => {
    return filters.attributes.map(att => {
      const attribute = parseKeys.attributeKey(att);
      return `${attribute.name}#${attribute.value}`;
    });
  }, [JSON.stringify(filters.attributes)]);

  const {
    data: assetsWithAttributesFilter,
    status: assetsWithAttributesFilterStatus,
  } = useAssetsWithAttributes(attFilterKeys);

  const apiStatus = useMergeStatus(
    ...(debouncedSearch
      ? [assetByNameStatus, assetSearchByDnsStatus, riskStatus]
      : [myAssetsStatus, riskStatus])
  );
  const isFetchingNextPage = debouncedSearch
    ? false
    : myAssetsIsFetchingNextPage;
  const error = debouncedSearch
    ? assetSearchByNameError || assetSearchByDnsError || risksError
    : myAssetsError || risksError;
  const fetchNextPage = debouncedSearch ? undefined : myAssetsFetchNextPage;
  const isFetching = debouncedSearch
    ? isFetchingAssetSearchByName ||
      isFetchingAssetSearchByDns ||
      isFetchingRisks
    : isFetchingMyAssets || isFetchingRisks;

  const status = isFilteredDataFetching ? 'pending' : apiStatus;

  const assets: Asset[] = useMemo(
    () =>
      debouncedSearch
        ? [
            ...(assetSearchByName?.assets || []),
            ...(assetSearchByDns?.assets || []),
          ].reduce((acc, asset: Asset) => {
            if (!acc.find(a => a.key === asset.key)) {
              acc.push(asset);
            }
            return acc;
          }, [] as Asset[])
        : myAssets,
    [
      debouncedSearch,
      JSON.stringify({ assetSearchByName, assetSearchByDns, myAssets }),
    ]
  );

  const openRiskDataset = useMemo(
    () => buildOpenRiskDataset(risks as Risk[]),
    [riskStatus]
  );

  const data = useMemo(() => {
    let filteredAssets = assets;

    if (assetsWithAttributesFilter.length > 0) {
      filteredAssets = assetsWithAttributesFilter
        .map(key => assets.find(asset => asset.key === key))
        .filter(Boolean) as Asset[];
    }

    if (filters.priorities.length > 0) {
      filteredAssets = filteredAssets.filter(({ status }) =>
        filters.priorities.includes(status)
      );
    }

    if (filters.sources?.filter(Boolean).length > 0) {
      filteredAssets = filteredAssets.filter(({ source }) =>
        filters.sources.includes(source)
      );
    }

    // merge risk data with asset data
    return filteredAssets.map(asset => {
      const riskSummary = openRiskDataset[asset.dns];

      if (riskSummary) {
        return { ...asset, riskSummary };
      }

      return asset;
    }) as AssetsWithRisk[];
  }, [
    JSON.stringify({
      assets,
      filters,
    }),
    assetsWithAttributesFilterStatus,
  ]);

  console.log('data', data);
  useEffect(() => {
    if (!isFetching) {
      if (filters.search) {
        setIsFilteredDataFetching(false);
        // If search is enabled, we need to fetch the search data
      } else {
        if (myAssetsFetchNextPage && data.length < 50) {
          setIsFilteredDataFetching(true);
          myAssetsFetchNextPage();
        } else {
          setIsFilteredDataFetching(false);
        }
      }
    }
  }, [
    JSON.stringify({ data }),
    filters.search,
    isFetching,
    Boolean(myAssetsFetchNextPage),
  ]);

  return { data, status, fetchNextPage, error, isFetchingNextPage, isFetching };
}
