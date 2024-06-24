import { Seed, SeedStatus } from '@/types';
import {
  AggregateCollection,
  defineAggregate,
  getDateFromISO,
} from '@/utils/aggregates/aggregate';

const getStatus = (seed: Seed): string => {
  return seed.status[0] === SeedStatus.Frozen ? 'Frozen' : 'Active';
};

/* 
  See the following link for more information on how to add new charts:
  https://github.com/praetorian-inc/chariot-ui?tab=readme-ov-file#adding-new-charts
*/
export const aggregates: AggregateCollection<Seed> = {
  countSeedsByStatus: defineAggregate<Seed>(
    'Count seeds by status',
    getStatus,
    'status',
    'count'
  ),
  countSeedsByClass: defineAggregate<Seed>(
    'Count seeds by class',
    seed => seed.class || '', // Return empty string if class is undefined
    'class',
    'count'
  ),
  seedsCreatedOverTime: defineAggregate<Seed>(
    'Seeds created over time',
    seed => getDateFromISO(seed.created),
    'date',
    'count'
  ),
};
