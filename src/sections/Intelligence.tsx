import React, { useEffect, useState } from 'react';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { PlusIcon } from '@heroicons/react/20/solid';
import {
  ArrowTrendingUpIcon,
  Bars3CenterLeftIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { Input, Type } from '@/components/form/Input';
import { Popover } from '@/components/Popover';
import { Tooltip } from '@/components/Tooltip';
import { NoData } from '@/components/ui/NoData';
import { ChartType, MyResourceKey } from '@/types';
import { aggregates as accountAggregates } from '@/utils/aggregates/account';
import { getAggregates } from '@/utils/aggregates/aggregate';
import { aggregates as assetAggregates } from '@/utils/aggregates/asset';
import { aggregates as riskAggregates } from '@/utils/aggregates/risk';
import { aggregates as seedAggregates } from '@/utils/aggregates/seed';
import { useStorage } from '@/utils/storage/useStorage.util';

interface ChartConfig {
  [id: string]: {
    type: ChartType;
    endpoint: MyResourceKey;
    aggregate: string;
    label: string;
  };
}

const Intelligence: React.FC = () => {
  const [charts, setCharts] = useStorage<ChartConfig>(
    { key: 'dashboardCharts' },
    {}
  );
  const [layout, setLayout] = useStorage<Layout[]>(
    { key: 'dashboardLayout' },
    []
  );
  const [newChartType, setNewChartType] = useState<ChartType>('area');
  const [newEndpoint, setNewEndpoint] = useState<MyResourceKey>();
  const [aggregates, setAggregates] = useState<
    { value: string; label: string }[]
  >([]);
  const [aggregate, setAggregate] = useState<string>();

  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  useEffect(() => {
    if (newEndpoint) {
      switch (newEndpoint.toLowerCase()) {
        case 'account':
          setAggregates(
            Object.keys(getAggregates(accountAggregates)).map(id => ({
              value: id,
              label: getAggregates(accountAggregates)[id].label,
            }))
          );
          break;
        case 'risk':
          setAggregates(
            Object.keys(getAggregates(riskAggregates)).map(id => ({
              value: id,
              label: getAggregates(riskAggregates)[id].label,
            }))
          );
          break;
        case 'seed':
          setAggregates(
            Object.keys(getAggregates(seedAggregates)).map(id => ({
              value: id,
              label: getAggregates(seedAggregates)[id].label,
            }))
          );
          break;
        case 'asset':
          setAggregates(
            Object.keys(getAggregates(assetAggregates)).map(id => ({
              value: id,
              label: getAggregates(assetAggregates)[id].label,
            }))
          );
          break;
        default:
          setAggregates([]);
      }
    } else {
      setAggregates([]);
    }
  }, [newEndpoint]);

  const addChart = () => {
    if (newEndpoint && aggregate) {
      const i = Date.now().toString();
      setCharts(charts => ({
        ...charts,
        [i]: {
          type: newChartType,
          endpoint: newEndpoint,
          aggregate,
          label: getAggregateName(aggregate),
        },
      }));
      setLayout(layout => {
        // Find the next coordinates to place the new chart
        const lastElement = layout.reduce(
          (acc, current) => {
            const currentSum = current.y + current.h;
            const existingSum = acc.y + acc.h;

            if (currentSum === existingSum) {
              return current.x + current.w > acc.x + acc.w ? current : acc;
            } else if (currentSum > existingSum) {
              return current;
            }
            return acc;
          },
          {
            x: -4,
            y: -4,
            w: 4,
            h: 4,
          } as Layout
        );
        const nextX =
          lastElement.x + lastElement.w + 4 <= 12
            ? lastElement.x + lastElement.w
            : 0;
        const nextY =
          nextX === 0 ? lastElement.y + lastElement.h : lastElement.y;
        return [
          ...layout,
          {
            i,
            x: nextX,
            y: nextY,
            w: 4,
            h: 4,
            minH: 2,
            minW: 2,
          },
        ];
      });
      setIsFormVisible(false);
    }
  };

  const removeChart = (chartId: string) => {
    setCharts(charts => {
      delete charts[chartId];
      return charts;
    });
    setLayout(layout => layout.filter(({ i }) => i !== chartId));
  };

  const getAggregateName = (aggregate: string) => {
    switch (newEndpoint) {
      case 'account':
        return getAggregates(accountAggregates)[aggregate]?.label;
      case 'risk':
        return getAggregates(riskAggregates)[aggregate]?.label;
      case 'seed':
        return getAggregates(seedAggregates)[aggregate]?.label;
      case 'asset':
        return getAggregates(assetAggregates)[aggregate]?.label;
      default:
        return '';
    }
  };

  return (
    <div className="size-full">
      <Popover
        onClick={() => setIsFormVisible(!isFormVisible)}
        type="button"
        open={isFormVisible}
        setOpen={setIsFormVisible}
        styleType="none"
        className="bg-header-light text-header-light"
        startIcon={<PlusIcon className="size-4" />}
        label="Add Widget"
        style={{ zIndex: 1 }}
      >
        <div className="w-[300px]">
          <Input
            type={Type.SELECT}
            name="endpoint"
            value={newEndpoint ?? ''}
            onChange={e => {
              setNewEndpoint(e.target.value as MyResourceKey);
              setAggregates([]);
              setAggregate(undefined);
            }}
            options={[
              { value: '', label: 'Select resource', disabled: true },
              { value: 'divider', label: '', divider: true },
              { value: 'seed', label: 'Seeds' },
              { value: 'asset', label: 'Assets' },
              { value: 'risk', label: 'Risks' },
              { value: 'account', label: 'Accounts' },
              { value: 'job', label: 'Jobs', disabled: true },
              { value: 'attribute', label: 'Attributes', disabled: true },
              { value: 'ref', label: 'References', disabled: true },
              { value: 'file', label: 'File', disabled: true },
            ]}
          />
          {aggregates.length > 0 && (
            <Input
              disabled={!newEndpoint}
              type={Type.SELECT}
              name="aggregate"
              className="mt-4"
              value={aggregate ?? ''}
              onChange={e => {
                setAggregate(e.target.value);
              }}
              options={[
                {
                  value: '',
                  label: 'Select widget',
                  disabled: true,
                },
                { value: 'divider', label: '', divider: true },
                ...(aggregates ?? []),
                { value: 'divider', label: '', divider: true },
                {
                  value: `https://github.com/praetorian-inc/chariot-ui/blob/main/src/utils/aggregates/${newEndpoint}.ts`,
                  label: 'Contribute more...',
                },
              ]}
            />
          )}
          {aggregate && newEndpoint && (
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <Tooltip title="Area Chart" placement="top">
                  <button
                    className={`w-12 rounded-[4px] p-2 ${newChartType === 'area' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewChartType('area')}
                  >
                    <ChartBarIcon className="m-auto size-6" />
                  </button>
                </Tooltip>
                <Tooltip title="Line Chart" placement="top">
                  <button
                    className={`w-12 rounded-[4px] p-2 ${newChartType === 'line' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewChartType('line')}
                  >
                    <ArrowTrendingUpIcon className="m-auto size-6 stroke-[3px]" />
                  </button>
                </Tooltip>
                <Tooltip title="Bar Chart" placement="top">
                  <button
                    className={`w-12 rounded-[4px] p-2 ${newChartType === 'bar' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewChartType('bar')}
                  >
                    <Bars3CenterLeftIcon className="m-auto size-6 -rotate-90 stroke-[4px]" />
                  </button>
                </Tooltip>
                <Tooltip title="Donut Chart" placement="top">
                  <button
                    className={`w-12 rounded-[4px] p-2 ${newChartType === 'donut' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewChartType('donut')}
                  >
                    <ChartPieIcon className="m-auto size-6" />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
          {aggregate && newEndpoint && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => setIsFormVisible(false)}
                type="button"
                styleType="secondary"
                className="rounded-[4px]"
              >
                Cancel
              </Button>
              <Button
                onClick={addChart}
                type="button"
                styleType="primary"
                className="rounded-[4px]"
              >
                Add Widget
              </Button>
            </div>
          )}
        </div>
      </Popover>

      {layout.length === 0 && (
        <NoData
          title="No widgets"
          description={`Click on the Add Widget button to add a new widget`}
        />
      )}
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={87}
        width={1290}
        onLayoutChange={setLayout}
      >
        {layout.map(({ i }) => {
          const chart = charts[i];
          return (
            <div key={i}>
              <ChartWrapper
                id={i}
                type={chart.type}
                endpoint={chart.endpoint}
                aggregate={chart.aggregate}
                label={chart.label}
                removeChart={removeChart}
              />
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};

export default Intelligence;
