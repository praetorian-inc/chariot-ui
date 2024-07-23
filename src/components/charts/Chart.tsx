import {
  AreaChart,
  BarChart,
  DonutChart,
  Legend,
  LineChart,
} from '@tremor/react';

import { ChartType } from '@/types';
import { CountData } from '@/utils/aggregates/aggregate';

interface ChartProps {
  type: ChartType;
  data: CountData[];
  xField: string;
  yField: string;
}

const defaultClass = 'text-xs size-full !h-full';

const Chart: React.FC<ChartProps> = ({ type, data, xField, yField }) => {
  switch (type) {
    case 'area':
      return (
        <AreaChart
          className={defaultClass}
          data={data}
          index={xField}
          categories={[yField]}
          yAxisWidth={30}
          connectNulls={true}
        />
      );
    case 'bar':
      return (
        <BarChart
          className={defaultClass}
          data={data}
          index={xField}
          categories={[yField]}
          colors={['blue']}
        />
      );
    case 'line':
      return (
        <LineChart
          className={defaultClass}
          data={data}
          index={xField}
          categories={[yField]}
          colors={['indigo', 'rose']}
        />
      );
    case 'donut':
      return (
        <div className="flex size-full items-center justify-center space-x-6 text-xs">
          <DonutChart
            className={defaultClass}
            variant="donut"
            data={data}
            index={xField}
            category={yField}
          />
          <Legend
            categories={data.map(d => (d[xField] ? d[xField].toString() : ''))}
          />
        </div>
      );
    default:
      return null;
  }
};

export default Chart;
