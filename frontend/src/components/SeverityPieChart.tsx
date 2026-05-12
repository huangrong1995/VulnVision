'use client';

import ReactECharts from 'echarts-for-react';

interface SeverityPieChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function SeverityPieChart({ data }: SeverityPieChartProps) {
  const option = {
    title: {
      text: 'Severity Distribution',
      left: 'center',
      top: 10,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 10,
      left: 'center'
    },
    color: ['#cf1322', '#fa8c16', '#ffe58f', '#f6ffed'],
    series: [
      {
        name: 'Severity',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        data: [
          { value: data.critical, name: 'Critical' },
          { value: data.high, name: 'High' },
          { value: data.medium, name: 'Medium' },
          { value: data.low, name: 'Low' }
        ]
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
