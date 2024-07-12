// eslint-disable-next-line no-restricted-imports
import { useQueries } from '@tanstack/react-query';

import { Snackbar } from '@/components/Snackbar';
import { AttributeFilterType } from '@/components/ui/AttributeFilter';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { Attribute } from '@/types';
import { mergeStatus, useMutation } from '@/utils/api';

interface CreateAttribute {
  key: string;
  class: string;
  name: string;
}

export const useCreateAttribute = () => {
  const axios = useAxios();
  const { invalidate: invalidateReference } = useMy(
    { resource: 'attribute' },
    { enabled: false }
  );

  return useMutation<void, Error, CreateAttribute>({
    defaultErrorMessage: `Failed to add attribute`,
    mutationFn: async attribute => {
      const { data } = await axios.post(`/attribute`, {
        key: attribute.key,
        name: attribute.class,
        value: attribute.name,
      });

      Snackbar({
        title: `Attribute added`,
        description: '',
        variant: 'success',
      });

      invalidateReference();

      return data;
    },
  });
};

export const useCommonAssetsWithAttributes = (
  attributes: AttributeFilterType
) => {
  const axios = useAxios();
  return useQueries({
    queries: Object.entries(attributes).reduce(
      (
        acc: { queryKey: string[]; queryFn: () => Promise<Attribute[]> }[],
        [key, values]
      ) => {
        if (values.length === 0) {
          return acc;
        }
        return acc.concat(
          values.map(value => {
            return {
              queryKey: getQueryKey.getMy('attribute', `#${key}#${value}`),
              queryFn: async () => {
                const res = await axios.get(`/my`, {
                  params: {
                    key: `#attribute#${key}#${value}`,
                  },
                });

                return res.data['attributes'] as Attribute[];
              },
            };
          })
        );
      },
      []
    ),
    combine: results => {
      return {
        data: results
          .filter(x => x)
          .reduce((acc, result) => {
            const currentSources = (result.data || []).map(
              (attribute: Attribute) => attribute.source
            );
            return acc.length === 0
              ? currentSources
              : acc.filter((source: string) => currentSources.includes(source));
          }, [] as string[]),
        status: mergeStatus(...results.map(result => result.status)),
      };
    },
  });
};
