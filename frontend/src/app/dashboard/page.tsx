'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Spin } from 'antd';
import { SafetyOutlined, AlertOutlined, BugOutlined, ThunderboltOutlined, GlobalOutlined } from '@ant-design/icons';
import { StatCard } from '@/components/StatCard';
import { SeverityPieChart } from '@/components/SeverityPieChart';
import { EPSSDistributionChart } from '@/components/EPSSDistributionChart';
import { CWETopChart } from '@/components/CWETopChart';
import { fetchDashboard } from '@/services/api';
import { useRouter } from 'next/navigation';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await fetchDashboard();
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 20, color: '#cf1322' }}>
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Dashboard</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total CVEs"
            value={data.total_cves}
            icon={<BugOutlined />}
            color="#1890ff"
            onClick={() => router.push('/cves')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Critical"
            value={data.critical_severity}
            icon={<AlertOutlined />}
            color="#cf1322"
            onClick={() => router.push('/cves?severity=critical')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="High Severity"
            value={data.high_severity}
            icon={<SafetyOutlined />}
            color="#fa8c16"
            onClick={() => router.push('/cves?severity=high')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="In KEV"
            value={data.in_kev}
            icon={<ThunderboltOutlined />}
            color="#722ed1"
            onClick={() => router.push('/cves?inKev=true')}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Has PoC"
            value={data.has_poc}
            icon={<AlertOutlined />}
            color="#52c41a"
            onClick={() => router.push('/cves?hasPoc=true')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Network Attack"
            value={data.network_attack}
            icon={<GlobalOutlined />}
            color="#eb2f96"
            onClick={() => router.push('/cves?attack_vector=NETWORK')}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <SeverityPieChart data={data.severity_distribution} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <EPSSDistributionChart data={data.epss_distribution} />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <CWETopChart data={data.top_cwes} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
