import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

import Chart from '@/components/charts/Chart';
import { useMy } from '@/hooks';
import { Account, Asset, ChartType, MyResourceKey, Risk, Seed } from '@/types';
import { aggregates as accountAggregates } from '@/utils/aggregates/account';
import { getAggregates, runAggregate } from '@/utils/aggregates/aggregate';
import { aggregates as assetAggregates } from '@/utils/aggregates/asset';
import { aggregates as riskAggregates } from '@/utils/aggregates/risk';

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
        case 'asset':
          return runAggregate(assetAggregates, aggregate, data as Asset[]);
        default:
          return [];
      }
    };
    const aggregateFunction = display()[aggregate];
    const chartData = run(aggregate, data as Account[]);

    return (
      <div className="relative flex size-full flex-col gap-4 border border-default bg-white p-6">
        <div className="flex items-center">
          <h3 className="dark:text-dark-tremor-content-strong flex-1 text-lg font-medium text-tremor-content-strong">
            {label}
          </h3>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => removeChart(id)}
            className=" size-7"
          >
            <XMarkIcon className="p-0.5" />
          </button>
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
