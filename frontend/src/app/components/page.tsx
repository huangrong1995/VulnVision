'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Tag, Spin, Statistic } from 'antd';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

interface Component {
  id: number;
  name: string;
  version: string;
  cve_count: number;
  latest_cve: string;
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function loadComponents() {
      try {
        const res = await fetch('http://localhost:8001/api/components');
        const data = await res.json();
        setComponents(data.components);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load components:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComponents();
  }, []);

  const columns: TableProps<Component>['columns'] = [
    {
      title: 'Component',
      key: 'name',
      render: (_, record) => (
        <span>
          <strong>{record.name}</strong>
          <span style={{ color: '#999', marginLeft: 8 }}>@{record.version}</span>
        </span>
      )
    },
    {
      title: 'CVE Count',
      dataIndex: 'cve_count',
      key: 'cve_count',
      width: 120,
      sorter: (a, b) => a.cve_count - b.cve_count,
      render: (count: number) => <Tag color="blue">{count} CVEs</Tag>
    },
    {
      title: 'Latest CVE',
      dataIndex: 'latest_cve',
      key: 'latest_cve',
      render: (cve: string) => cve ? <a onClick={() => router.push(`/cves/${cve}`)}>{cve}</a> : '-'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Components</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Card>
            <Statistic title="Total Components" value={total} />
          </Card>
        </Col>
        <Col>
          <Card>
            <Statistic title="Total CVEs" value={components.reduce((sum, c) => sum + c.cve_count, 0)} />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={components}
        rowKey="id"
        pagination={false}
        size="middle"
        style={{ background: '#fff', borderRadius: 8 }}
        onRow={(record) => ({
          onClick: () => router.push(`/components/${record.id}`),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
}
