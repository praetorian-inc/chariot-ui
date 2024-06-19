import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

import Chart from '@/components/charts/Chart';
import { useMy } from '@/hooks';
import { Account, Asset, ChartType, MyResourceKey, Risk, Seed } from '@/types';
import { aggregates as accountAggregates } from '@/utils/aggregates/account';
import { getAggregates, runAggregate } from '@/utils/aggregates/aggregate';
import { aggregates as assetAggregates } from '@/utils/aggregates/asset';
import { aggregates as riskAggregates } from '@/utils/aggregates/risk';
import { aggregates as seedAggregates } from '@/utils/aggregates/seed';

interface ChartWrapperProps {
  id: string;
  type: ChartType;
  endpoint: MyResourceKey;
  aggregate: string;
  label: string;
  removeChart: (chartId: string) => void;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  id,
  type,
  endpoint,
  aggregate,
  label,
  removeChart,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { data, isLoading } = useMy({
    resource: endpoint,
    query: '',
  });

  if (!isLoading && data) {
    const display = () => {
      switch (endpoint) {
        case 'account':
          return getAggregates(accountAggregates);
        case 'risk':
          return getAggregates(riskAggregates);
        case 'seed':
          return getAggregates(seedAggregates);
        case 'asset':
          return getAggregates(assetAggregates);
        default:
          return {};
      }
    };
    const run = (
      aggregate: string,
      data: Account[] | Risk[] | Seed[] | Asset[]
    ) => {
      switch (endpoint) {
        case 'account':
          return runAggregate(accountAggregates, aggregate, data as Account[]);
        case 'risk':
          return runAggregate(riskAggregates, aggregate, data as Risk[]);
        case 'seed':
          return runAggregate(seedAggregates, aggregate, data as Seed[]);
        case 'asset':
          return runAggregate(assetAggregates, aggregate, data as Asset[]);
        default:
          return [];
      }
    };
    const aggregateFunction = display()[aggregate];
    const chartData = run(aggregate, data as Account[]);

    return (
      <div
        className="relative flex size-full flex-col gap-4 border border-gray-200 bg-white p-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center">
          <h3 className="dark:text-dark-tremor-content-strong flex-1 text-lg font-medium text-tremor-content-strong">
            {label}
          </h3>
          {isHovered && (
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => removeChart(id)}
              className="absolute right-[-6px] top-[-6px] size-6 rounded-full border border-gray-200 bg-layer0 text-gray-500"
            >
              <XMarkIcon className="p-0.5" />
            </button>
          )}
        </div>
        <Chart
          type={type}
          data={chartData}
          xField={aggregateFunction.xField}
          yField={aggregateFunction.yField}
        />
      </div>
    );
  } else {
    return <></>;
  }
};

export default ChartWrapper;
