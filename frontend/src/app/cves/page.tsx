'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { Table, Input, Select, Space, Tag, Spin, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TableProps } from 'antd';
import { fetchCVEs } from '@/services/api';
import type { CVE, CVEListResponse } from '@/types';

const { Option } = Select;

function CVEsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadCVEs = useCallback(async () => {
    const sev = searchParams.get('severity') || undefined;
    const av = searchParams.get('attack_vector') || undefined;
    const cweParam = searchParams.get('cwe') || undefined;
    const epss = searchParams.get('epss_category') || undefined;
    const kev = searchParams.get('inKev') || undefined;
    const poc = searchParams.get('hasPoc') || undefined;
    const search = searchParams.get('search') || '';

    setLoading(true);
    try {
      const result = await fetchCVEs({
        severity: sev,
        attack_vector: av,
        search: search || undefined,
        page,
        limit: pageSize,
        cwe: cweParam,
        epss_category: epss,
        in_kev: kev,
        has_poc: poc
      }) as CVEListResponse;
      const cvesWithIndex = result.cves.map((cve, idx) => ({
        ...cve,
        _uid: `${cve.id}-${page}-${idx}`
      }));
      setCves(cvesWithIndex);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load CVEs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, pageSize]);

  useEffect(() => {
    loadCVEs();
  }, [loadCVEs]);

  // Update URL with new filter value
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/cves?${params.toString()}`);
  };

  // Update search
  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/cves?${params.toString()}`);
  };

  // Get current filter values from URL
  const currentSeverity = searchParams.get('severity') || undefined;
  const currentAttackVector = searchParams.get('attack_vector') || undefined;
  const currentSearch = searchParams.get('search') || '';

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'green'
    };
    return colors[sev?.toLowerCase()] || 'default';
  };

  const columns: TableProps<CVE>['columns'] = [
    {
      title: 'CVE ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string) => (
        <a href={`/cves/${text}`} style={{ fontWeight: 500 }}>{text}</a>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      sorter: (a, b) => {
        const order: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (order[a.severity || ''] || 0) - (order[b.severity || ''] || 0);
      },
      render: (sev: string) => (
        <Tag color={getSeverityColor(sev)}>{sev?.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Risk',
      dataIndex: 'risk',
      key: 'risk',
      width: 80,
      sorter: (a, b) => (a.risk || 0) - (b.risk || 0),
      render: (risk: number) => risk || '-'
    },
    {
      title: 'Attack Vector',
      dataIndex: 'attackVector',
      key: 'attackVector',
      width: 120,
      render: (av: string) => av || '-'
    },
    {
      title: 'Component',
      key: 'component',
      width: 200,
      render: (_, record) => (
        <span>
          {record.component?.name || '-'}
          {record.component?.version && <span style={{ color: '#999', marginLeft: 4 }}>@{record.component.version}</span>}
        </span>
      )
    },
    {
      title: 'EPSS',
      dataIndex: 'epssScore',
      key: 'epssScore',
      width: 80,
      sorter: (a, b) => (a.epssScore || 0) - (b.epssScore || 0),
      render: (score: number) => score?.toFixed(4) || '-'
    },
    {
      title: 'CWE',
      dataIndex: 'cwes',
      key: 'cwes',
      width: 150,
      render: (cwes: string[]) => cwes?.map(cwe => (
        <Tag key={cwe} style={{ margin: '2px' }}>{cwe}</Tag>
      )) || '-'
    },
    {
      title: 'Exploit',
      dataIndex: 'exploitMaturity',
      key: 'exploitMaturity',
      width: 100,
      render: (exp: string) => exp ? <Tag color="red">{exp}</Tag> : '-'
    },
    {
      title: 'KEV',
      dataIndex: 'inKev',
      key: 'inKev',
      width: 80,
      render: (inKev: boolean) => inKev ? <Tag color="purple">KEV</Tag> : '-'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Vulnerabilities</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search CVEs..."
            prefix={<SearchOutlined />}
            allowClear
            value={currentSearch}
            onChange={(e) => updateSearch(e.target.value)}
            onPressEnter={(e) => updateSearch((e.target as HTMLInputElement).value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Severity"
            allowClear
            value={currentSeverity}
            onChange={(v) => updateFilter('severity', v)}
            style={{ width: '100%' }}
          >
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Attack Vector"
            allowClear
            value={currentAttackVector}
            onChange={(v) => updateFilter('attack_vector', v)}
            style={{ width: '100%' }}
          >
            <Option value="NETWORK">Network</Option>
            <Option value="LOCAL">Local</Option>
            <Option value="PHYSICAL">Physical</Option>
            <Option value="ADJACENT_NETWORK">Adjacent</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Space>
            <span style={{ color: '#666' }}>Total: {total} CVEs</span>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={cves}
          rowKey={(record) => record._uid || record.id}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps || 20);
            }
          }}
          size="middle"
          style={{ background: '#fff', borderRadius: 8 }}
        />
      </Spin>
    </div>
  );
}

export default function CVEsPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>}>
      <CVEsContent />
    </Suspense>
  );
}
