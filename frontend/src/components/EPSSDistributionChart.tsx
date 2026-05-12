'use client';

import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';

interface EPSSDistributionChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function EPSSDistributionChart({ data }: EPSSDistributionChartProps) {
  const router = useRouter();

  const handleClick = (params: any) => {
    const category = params.name as string;
    router.push(`/cves?epss_category=${category.toLowerCase()}`);
  };

  const option = {
    title: {
      text: 'EPSS Risk Distribution (Click to filter)',
      left: 'center',
      top: 10,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Critical', 'High', 'Medium', 'Low'],
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 }
    },
    color: ['#cf1322', '#fa8c16', '#eac500', '#52c41a'],
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: [
          { value: data.critical, itemStyle: { color: '#cf1322' } },
          { value: data.high, itemStyle: { color: '#fa8c16' } },
          { value: data.medium, itemStyle: { color: '#eac500' } },
          { value: data.low, itemStyle: { color: '#52c41a' } }
        ],
        barWidth: '50%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      onEvents={{ click: handleClick }}
    />
  );
}
