'use client';

import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, trend, trendValue, color, onClick }: StatCardProps) {
  return (
    <Card
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s, transform 0.2s',
      }}
      styles={{
        body: { padding: 20 }
      }}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Statistic
          title={<span style={{ fontSize: 14, color: '#666' }}>{title}</span>}
          value={value}
          styles={{ content: { fontSize: 28, fontWeight: 600, color: color || '#333' } }}
        />
        {icon && (
          <div style={{
            fontSize: 36,
            color: color || '#1890ff',
            opacity: 0.8
          }}>
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend === 'up' ? <ArrowUpOutlined style={{ color: '#cf1322' }} /> : <ArrowDownOutlined style={{ color: '#3f8600' }} />}
          <span style={{ color: trend === 'up' ? '#cf1322' : '#3f8600', fontSize: 12 }}>
            {trendValue}
          </span>
        </div>
      )}
    </Card>
  );
}
