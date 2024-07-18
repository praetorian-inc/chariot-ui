import { useMemo } from 'react';

import { useCounts } from '@/hooks/useCounts';
import { JobStatus, Statistics } from '@/types';

export const useAggregateCounts = (): {
  isPending: boolean;
  counts: {
    assets: number;
    risks: number;
    jobs: number;
    jobsRunning: number;
  };
} => {
  const { data: assetStats = {}, status: assetStatus } = useCounts({
    resource: 'asset',
    filterByGlobalSearch: true,
  });

  const { data: riskStats = {}, status: riskStatus } = useCounts({
    resource: 'risk',
    filterByGlobalSearch: true,
  });

  const { data: jobStats = {}, status: jobStatus } = useCounts({
    resource: 'job',
    filterByGlobalSearch: true,
  });

  const isPending = [assetStatus, riskStatus, jobStatus].some(
    status => status === 'pending'
  );

  const getTotal = (stats: Statistics): number =>
    Object.values(stats || {}).reduce(
      (acc, val) => (acc + (typeof val === 'number' ? val : 0)) as number,
      0
    );

  // Only count open risks
  const openRiskStats = useMemo(() => {
    const allStats: { [key: string]: number } = {
      ...(riskStats?.status || {}),
    };
    for (const key in allStats) {
      if (!key.startsWith('O')) {
        delete allStats[key];
      }
    }
    return allStats;
  }, [riskStats]);

  const counts = {
    assets: getTotal(assetStats?.['status'] as Statistics),
    risks: getTotal(openRiskStats),
    jobs: getTotal(jobStats?.['status'] as Statistics),
    jobsRunning: jobStats?.['status']?.[JobStatus.Running] || 0,
  };

  return {
    isPending,
    counts,
  };
};
