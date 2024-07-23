import { Asset } from '@/types';
import {
  AggregateCollection,
  defineAggregate,
  getDateFromISO,
} from '@/utils/aggregates/aggregate';

/* 
  See the following link for more information on how to add new charts:
  https://github.com/praetorian-inc/chariot-ui?tab=readme-ov-file#adding-new-charts
*/
export const aggregates: AggregateCollection<Asset> = {
  assetsCreatedOverTime: defineAggregate<Asset>(
    'Assets created over time',
    asset => getDateFromISO(asset.created),
    'date',
    'cumulativeAssets'
  ),
};
