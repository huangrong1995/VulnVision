'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import ReactECharts from 'echarts-for-react';
import type { TableProps } from 'antd';

interface CWESeverity {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface CWEItem {
  cwe: string;
  count: number;
  severity: CWESeverity;
}

interface CWEStats {
  total_cwes: number;
  cwe_list: CWEItem[];
}

export default function CWEsPage() {
  const [stats, setStats] = useState<CWEStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCWEStats() {
      try {
        const res = await fetch('http://localhost:8001/api/cwes');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load CWE stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCWEStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalCVEs = stats.cwe_list.reduce((sum, item) => sum + item.count, 0);

  const pieOption = {
    title: { text: 'CWE Distribution', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 600 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}' },
      data: stats.cwe_list.slice(0, 5).map(item => ({
        name: item.cwe,
        value: item.count
      }))
    }]
  };

  const columns: TableProps<CWEItem>['columns'] = [
    {
      title: 'CWE',
      dataIndex: 'cwe',
      key: 'cwe',
      render: (cwe: string) => <Tag color="blue">{cwe}</Tag>
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      sorter: (a, b) => a.count - b.count,
      render: (count: number) => <strong>{count}</strong>
    },
    {
      title: 'Severity Breakdown',
      key: 'severity',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {record.severity.critical > 0 && <Tag color="red">{record.severity.critical} CRIT</Tag>}
          {record.severity.high > 0 && <Tag color="orange">{record.severity.high} HIGH</Tag>}
          {record.severity.medium > 0 && <Tag color="gold">{record.severity.medium} MED</Tag>}
          {record.severity.low > 0 && <Tag color="green">{record.severity.low} LOW</Tag>}
        </div>
      )
    },
    {
      title: 'Share',
      key: 'share',
      width: 150,
      render: (_, record) => (
        <Progress
          percent={Math.round((record.count / totalCVEs) * 100)}
          size="small"
          strokeColor="#1890ff"
        />
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>CWE Analysis</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>{stats.total_cwes}</div>
              <div style={{ color: '#666' }}>Total CWEs</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#cf1322' }}>{stats.cwe_list[0]?.count || 0}</div>
              <div style={{ color: '#666' }}>Most Common</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Table
            columns={columns}
            dataSource={stats.cwe_list}
            rowKey="cwe"
            pagination={{ pageSize: 10 }}
            size="middle"
            style={{ background: '#fff', borderRadius: 8 }}
          />
        </Col>
      </Row>
    </div>
  );
}
