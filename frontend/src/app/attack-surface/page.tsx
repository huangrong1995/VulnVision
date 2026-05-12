'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

interface AttackVectorCVEs {
  id: string;
  severity: string;
  risk: number;
  component: string;
  inKev: boolean;
}

interface AttackVectorData {
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  cves: AttackVectorCVEs[];
}

interface AttackSurfaceData {
  summary: {
    total: number;
    network: number;
    local: number;
    physical: number;
    adjacent: number;
  };
  by_vector: {
    NETWORK: AttackVectorData;
    LOCAL: AttackVectorData;
    PHYSICAL: AttackVectorData;
    ADJACENT_NETWORK: AttackVectorData;
  };
}

export default function AttackSurfacePage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AttackSurfaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const res = await fetch('http://localhost:8001/api/attack-surface');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Failed to load attack surface data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const { summary, by_vector } = data;

  const radarOption = {
    title: { text: 'Attack Vector Distribution', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 600 } },
    tooltip: {},
    radar: {
      indicator: [
        { name: 'NETWORK', max: 50 },
        { name: 'LOCAL', max: 50 },
        { name: 'PHYSICAL', max: 50 },
        { name: 'ADJACENT', max: 50 }
      ],
      radius: '65%'
    },
    series: [{
      type: 'radar',
      data: [{
        value: [by_vector.NETWORK.count, by_vector.LOCAL.count, by_vector.PHYSICAL.count, by_vector.ADJACENT_NETWORK.count],
        name: 'CVEs by Attack Vector',
        areaStyle: { opacity: 0.3 }
      }]
    }]
  };

  const barOption = {
    title: { text: 'Severity by Attack Vector', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 600 } },
    tooltip: { trigger: 'axis' as const },
    legend: { bottom: 10, left: 'center' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '40%', containLabel: true },
    xAxis: { type: 'category', data: ['NETWORK', 'LOCAL', 'PHYSICAL', 'ADJACENT'] },
    yAxis: { type: 'value' as const },
    series: [
      { name: 'Critical', type: 'bar' as const, data: [by_vector.NETWORK.critical, by_vector.LOCAL.critical, by_vector.PHYSICAL.critical, by_vector.ADJACENT_NETWORK.critical], stack: 'total', itemStyle: { color: '#cf1322' } },
      { name: 'High', type: 'bar' as const, data: [by_vector.NETWORK.high, by_vector.LOCAL.high, by_vector.PHYSICAL.high, by_vector.ADJACENT_NETWORK.high], stack: 'total', itemStyle: { color: '#fa8c16' } },
      { name: 'Medium', type: 'bar' as const, data: [by_vector.NETWORK.medium, by_vector.LOCAL.medium, by_vector.PHYSICAL.medium, by_vector.ADJACENT_NETWORK.medium], stack: 'total', itemStyle: { color: '#faad14' } },
      { name: 'Low', type: 'bar' as const, data: [by_vector.NETWORK.low, by_vector.LOCAL.low, by_vector.PHYSICAL.low, by_vector.ADJACENT_NETWORK.low], stack: 'total', itemStyle: { color: '#52c41a' } }
    ]
  };

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = { critical: 'red', high: 'orange', medium: 'gold', low: 'green' };
    return colors[sev?.toLowerCase()] || 'default';
  };

  const vectorColumns: TableProps<AttackVectorCVEs>['columns'] = [
    { title: 'CVE ID', dataIndex: 'id', key: 'id', render: (id: string) => <a onClick={() => router.push(`/cves/${id}`)}>{id}</a> },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (sev: string) => <Tag color={getSeverityColor(sev)}>{sev?.toUpperCase()}</Tag> },
    { title: 'Risk', dataIndex: 'risk', key: 'risk' },
    { title: 'Component', dataIndex: 'component', key: 'component' },
    { title: 'KEV', dataIndex: 'inKev', key: 'inKev', render: (inKev: boolean) => inKev ? <Tag color="purple">KEV</Tag> : '-' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Attack Surface Analysis</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#1890ff' }}>{summary.total}</div>
              <div style={{ color: '#666' }}>Total CVEs</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#cf1322' }}>{summary.network}</div>
              <div style={{ color: '#666' }}>Network</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#fa8c16' }}>{summary.local}</div>
              <div style={{ color: '#666' }}>Local</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#722ed1' }}>{summary.adjacent}</div>
              <div style={{ color: '#666' }}>Adjacent</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>{mounted && <ReactECharts option={radarOption} style={{ height: 300 }} />}</Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>{mounted && <ReactECharts option={barOption} style={{ height: 300 }} />}</Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Network Attack CVEs">
            <Table columns={vectorColumns} dataSource={by_vector.NETWORK.cves} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
