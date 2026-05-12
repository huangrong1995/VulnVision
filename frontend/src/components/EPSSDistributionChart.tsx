'use client';

import ReactECharts from 'echarts-for-react';

interface EPSSDistributionChartProps {
  data: {
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
}

export function EPSSDistributionChart({ data }: EPSSDistributionChartProps) {
  const option = {
    title: {
      text: 'EPSS Risk Distribution',
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
      data: ['High Risk', 'Medium Risk', 'Low Risk'],
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 }
    },
    color: ['#cf1322', '#fa8c16', '#52c41a'],
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: [
          { value: data.high_risk, itemStyle: { color: '#cf1322' } },
          { value: data.medium_risk, itemStyle: { color: '#fa8c16' } },
          { value: data.low_risk, itemStyle: { color: '#52c41a' } }
        ],
        barWidth: '50%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
