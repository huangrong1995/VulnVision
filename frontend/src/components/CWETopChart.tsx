'use client';

import ReactECharts from 'echarts-for-react';

interface CWETopChartProps {
  data: Array<{ cwe: string; count: number }>;
}

export function CWETopChart({ data }: CWETopChartProps) {
  const chartData = data.slice(0, 10).map(item => ({
    cwe: item.cwe,
    count: item.count
  }));

  const option = {
    title: {
      text: 'Top 10 CWEs',
      left: 'center',
      top: 10,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c} CVEs'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 50,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(item => item.cwe).reverse(),
      axisLabel: { fontSize: 10 }
    },
    color: ['#1890ff'],
    series: [
      {
        name: 'CVEs',
        type: 'bar',
        data: chartData.map(item => item.count).reverse(),
        barWidth: '60%',
        itemStyle: {
          borderRadius: [0, 6, 6, 0]
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 350 }} />;
}
