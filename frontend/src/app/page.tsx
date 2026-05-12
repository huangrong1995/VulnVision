'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Button, Card, message, Alert, Space } from 'antd';
import { UploadOutlined, CheckCircleOutlined, InboxOutlined, DashboardOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Dragger } = Upload;

interface ImportResult {
  status: string;
  total: number;
  success: number;
  failed: number;
  message: string;
}

export default function HomePage() {
  const router = useRouter();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    fileList,
    beforeUpload: (file) => {
      if (!file.name.endsWith('.json')) {
        message.error('Only JSON files are supported');
        return false;
      }
      setFileList([file as unknown as UploadFile]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setImportResult(null);
    },
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file first');
      return;
    }

    setUploading(true);
    const file = fileList[0];

    try {
      const formData = new FormData();
      formData.append('file', file as unknown as Blob, file.name);

      const res = await fetch('http://localhost:8001/api/import/cves', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      setImportResult(result);

      if (result.status === 'success') {
        message.success(`Successfully imported ${result.success} CVEs`);
      } else {
        message.error(result.message || 'Import failed');
      }
    } catch (err) {
      message.error('Failed to import file. Make sure the backend is running.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Import CVE Data</h1>

      <Card style={{ marginBottom: 24 }}>
        <Alert
          title="Supported Format"
          description={
            <div>
              <p style={{ margin: '8px 0' }}>Upload a JSON file containing CVE vulnerability data. The file should be a JSON array of vulnerability objects.</p>
              <p style={{ margin: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                Example: [&#123;&quot;id&quot;: &quot;CVE-2025-1234&quot;, &quot;severity&quot;: &quot;high&quot;, &quot;component&quot;: &#123;&quot;name&quot;: &quot;OpenSSL&quot;, &quot;version&quot;: &quot;1.0.2&quot;&#125;, ...&#125;]
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag JSON file to upload</p>
          <p className="ant-upload-hint">Support for a single JSON file containing CVE data</p>
        </Dragger>

        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleImport}
                loading={uploading}
              >
                Import CVEs
              </Button>
              <Button onClick={() => { setFileList([]); setImportResult(null); }}>
                Clear
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {importResult && importResult.status === 'success' && (
        <Card title="Import Result" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><span>Total Records:</span> <strong>{importResult.total}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Success:</span> <strong>{importResult.success}</strong>
            </div>
            <div><span>Failed:</span> <strong>{importResult.failed}</strong></div>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<DashboardOutlined />}
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}

      {importResult && importResult.status !== 'success' && (
        <Card title="Import Result">
          <Alert title={importResult.message} type="error" showIcon />
        </Card>
      )}

      <Card title="Expected JSON Format" style={{ marginTop: 24 }}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
{`[
  {
    "id": "CVE-2025-1234",
    "title": "Vulnerability Title",
    "severity": "high",
    "risk": 85,
    "description": "Description of the vulnerability",
    "component": {
      "name": "OpenSSL",
      "version": "1.0.2"
    },
    "cwes": ["CWE-787"],
    "epssScore": 0.045,
    "attackVector": "NETWORK",
    "inKev": false,
    "exploitMaturity": "",
    "remediation": "Upgrade to latest version"
  }
]`}
        </pre>
      </Card>
    </div>
  );
}