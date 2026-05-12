'use client';

import { Suspense, useEffect, useState } from 'react';
import { Table, Input, Select, Button, Space, Tag, Spin, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
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
  const [severity, setSeverity] = useState<string | undefined>();
  const [attackVector, setAttackVector] = useState<string | undefined>();
  const [cwe, setCwe] = useState<string | undefined>();
  const [epssCategory, setEpssCategory] = useState<string | undefined>();
  const [inKev, setInKev] = useState<string | undefined>();
  const [hasPoc, setHasPoc] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const sev = searchParams.get('severity');
    const av = searchParams.get('attack_vector');
    const cweParam = searchParams.get('cwe');
    const epss = searchParams.get('epss_category');
    const kev = searchParams.get('inKev');
    const poc = searchParams.get('hasPoc');

    if (sev) setSeverity(sev);
    else setSeverity(undefined);

    if (av) setAttackVector(av);
    else setAttackVector(undefined);

    if (cweParam) setCwe(cweParam);
    else setCwe(undefined);

    if (epss) setEpssCategory(epss);
    else setEpssCategory(undefined);

    if (kev) setInKev(kev);
    else setInKev(undefined);

    if (poc) setHasPoc(poc);
    else setHasPoc(undefined);

    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    loadCVEs();
  }, [page, pageSize, severity, attackVector, cwe, epssCategory, inKev, hasPoc, search]);

  const loadCVEs = async () => {
    setLoading(true);
    try {
      const result = await fetchCVEs({ severity, attack_vector: attackVector, search, page, limit: pageSize, cwe, epss_category: epssCategory, in_kev: inKev, has_poc: hasPoc }) as CVEListResponse;
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
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Severity"
            allowClear
            value={severity}
            onChange={(v) => { setSeverity(v); setPage(1); }}
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
            value={attackVector}
            onChange={(v) => { setAttackVector(v); setPage(1); }}
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