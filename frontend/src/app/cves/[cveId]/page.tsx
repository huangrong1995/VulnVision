'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Spin, Descriptions, Table, Progress, Alert } from 'antd';
import { useParams } from 'next/navigation';
import ReactECharts from 'echarts-for-react';
import { fetchCVEDetail } from '@/services/api';
import type { CVE } from '@/types';

export default function CVEDetailPage() {
  const params = useParams();
  const cveId = params.cveId as string;

  const [cve, setCve] = useState<CVE | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCVE() {
      if (!cveId) return;
      setLoading(true);
      try {
        const result = await fetchCVEDetail(cveId) as CVE;
        setCve(result);
      } catch (err) {
        setError('Failed to load CVE details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCVE();
  }, [cveId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !cve) {
    return (
      <div style={{ padding: 20 }}>
        <Alert type="error" message={error || 'CVE not found'} />
      </div>
    );
  }

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'green'
    };
    return colors[sev?.toLowerCase()] || 'default';
  };

  const epssGaugeOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 1,
        splitNumber: 8,
        center: ['50%', '75%'],
        radius: '90%',
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.1, '#52c41a'],
              [0.5, '#fa8c16'],
              [1, '#cf1322']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: { color: '#1890ff' }
        },
        axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
        splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
        axisLabel: {
          formatter: (value: number) => value.toFixed(2),
          distance: -60,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: (value: number) => `{value|${value.toFixed(4)}}`,
          color: '#333',
          fontSize: 20,
          offsetCenter: [0, '-10%'],
          rich: {
            value: { fontSize: 24, fontWeight: 'bold' }
          }
        },
        data: [{ value: cve.epssScore || 0, name: 'EPSS Score' }]
      }
    ]
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>{cve.id}</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Basic Information" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="CVE ID">{cve.id}</Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color={getSeverityColor(cve.severity)}>{cve.severity?.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score">{cve.risk}</Descriptions.Item>
              <Descriptions.Item label="Attack Vector">{cve.attackVector}</Descriptions.Item>
              <Descriptions.Item label="Component">
                {cve.component?.name} {cve.component?.version && `@${cve.component.version}`}
              </Descriptions.Item>
              <Descriptions.Item label="EPSS Score">{cve.epssScore?.toFixed(4)}</Descriptions.Item>
              <Descriptions.Item label="EPSS Percentile">{cve.epssPercentile?.toFixed(4)}</Descriptions.Item>
              <Descriptions.Item label="In KEV">
                {cve.inKev ? <Tag color="purple">KEV</Tag> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Exploit Maturity">
                {cve.exploitMaturity ? <Tag color="red">{cve.exploitMaturity}</Tag> : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Description" style={{ marginBottom: 16 }}>
            <p>{cve.description || 'No description available.'}</p>
          </Card>

          <Card title="CWE References">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cve.cwes?.map(cwe => (
                <Tag key={cwe} style={{ fontSize: 14, padding: '4px 8px' }}>{cwe}</Tag>
              )) || '-'}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="EPSS Risk Score" style={{ marginBottom: 16 }}>
            <ReactECharts option={epssGaugeOption} style={{ height: 200 }} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Progress
                percent={((cve.epssPercentile || 0) * 100)}
                format={(p) => `Percentile: ${p?.toFixed(1)}%`}
                strokeColor={{
                  '0%': '#52c41a',
                  '50%': '#fa8c16',
                  '100%': '#cf1322'
                }}
              />
            </div>
          </Card>

          <Card title="Remediation">
            <p>{cve.remediation || 'No remediation information available.'}</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
