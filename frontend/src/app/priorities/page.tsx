'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Progress } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

interface PriorityCVE {
  id: string;
  severity: string;
  risk: number;
  component: string;
  epssScore: number;
  inKev: boolean;
  exploitMaturity: string;
}

interface PriorityData {
  summary: {
    total: number;
    p0_critical: number;
    p1_high: number;
    p2_medium: number;
    p3_low: number;
  };
  p0_critical: PriorityCVE[];
  p1_high: PriorityCVE[];
  p2_medium: PriorityCVE[];
  p3_low: PriorityCVE[];
}

const priorityColors: Record<string, string> = {
  p0: '#cf1322',
  p1: '#fa8c16',
  p2: '#faad14',
  p3: '#52c41a'
};

const priorityLabels: Record<string, string> = {
  p0: 'P0 Critical',
  p1: 'P1 High',
  p2: 'P2 Medium',
  p3: 'P3 Low'
};

export default function PrioritiesPage() {
  const [data, setData] = useState<PriorityData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('http://localhost:8001/api/priorities');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Failed to load priority data:', err);
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

  const { summary } = data;

  const pieData = [
    { name: 'P0 Critical', value: summary.p0_critical },
    { name: 'P1 High', value: summary.p1_high },
    { name: 'P2 Medium', value: summary.p2_medium },
    { name: 'P3 Low', value: summary.p3_low }
  ];

  const pieOption = {
    title: { text: 'Priority Distribution', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 600 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{c}' },
      data: pieData.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: priorityColors[item.name.split(' ')[0].toLowerCase()] }
      }))
    }]
  };

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = { critical: 'red', high: 'orange', medium: 'gold', low: 'green' };
    return colors[sev?.toLowerCase()] || 'default';
  };

  const columns: TableProps<PriorityCVE>['columns'] = [
    { title: 'CVE ID', dataIndex: 'id', key: 'id', render: (id: string) => <a onClick={() => router.push(`/cves/${id}`)}>{id}</a> },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (sev: string) => <Tag color={getSeverityColor(sev)}>{sev?.toUpperCase()}</Tag> },
    { title: 'Risk', dataIndex: 'risk', key: 'risk' },
    { title: 'Component', dataIndex: 'component', key: 'component' },
    { title: 'EPSS', dataIndex: 'epssScore', key: 'epssScore', render: (s: number) => s?.toFixed(4) },
    { title: 'KEV', dataIndex: 'inKev', key: 'inKev', render: (inKev: boolean) => inKev ? <Tag color="purple">KEV</Tag> : '-' },
    { title: 'Exploit', dataIndex: 'exploitMaturity', key: 'exploitMaturity', render: (exp: string) => exp ? <Tag color="red">{exp}</Tag> : '-' }
  ];

  const allPriorityData = [
    { priority: 'p0', label: 'P0 Critical', cves: data.p0_critical, color: priorityColors.p0 },
    { priority: 'p1', label: 'P1 High', cves: data.p1_high, color: priorityColors.p1 },
    { priority: 'p2', label: 'P2 Medium', cves: data.p2_medium, color: priorityColors.p2 },
    { priority: 'p3', label: 'P3 Low', cves: data.p3_low, color: priorityColors.p3 }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Risk Priority Engine</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {allPriorityData.map(item => (
          <Col key={item.priority} xs={12} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: item.color }}>{summary[item.priority as keyof typeof summary]}</div>
                <div style={{ color: '#666' }}>{item.label}</div>
                <Progress
                  percent={Math.round((summary[item.priority as keyof typeof summary] as number / summary.total) * 100)}
                  size="small"
                  strokeColor={item.color}
                  showInfo={false}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card><ReactECharts option={pieOption} style={{ height: 300 }} /></Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Priority Triage Guide">
            <div style={{ lineHeight: 1.8 }}>
              <Tag color="red">P0 Critical</Tag> - RCE, 0-day, KEV, exploit available<br/>
              <Tag color="orange">P1 High</Tag> - Remote code execution, high CVSS<br/>
              <Tag color="gold">P2 Medium</Tag> - Local privilege escalation, moderate CVSS<br/>
              <Tag color="green">P3 Low</Tag> - Informational, low CVSS, no current exploit
            </div>
          </Card>
        </Col>
      </Row>

      {allPriorityData.map(item => (
        <Row key={item.priority} gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title={<Tag color={item.color}>{item.label}</Tag>} size="small">
              <Table columns={columns} dataSource={item.cves} rowKey="id" pagination={false} size="small" />
            </Card>
          </Col>
        </Row>
      ))}
    </div>
  );
}
