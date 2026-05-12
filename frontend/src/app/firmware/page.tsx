'use client';

import { Tree, Card, Tag, Input, Row, Col, Spin } from 'antd';
import { useState, useEffect } from 'react';
import type { DataNode } from 'antd/es/tree';

interface FileNode {
  key: string;
  title: string;
  isVulnerable: boolean;
  children?: FileNode[];
}

interface FirmwareTree {
  projectName: string;
  version: string;
  fileTree: FileNode;
  totalFiles: number;
  vulnerableFiles: number;
}

const mockTreeData: FirmwareTree = {
  projectName: "IoT_Firmware_v1.2.3",
  version: "1.2.3",
  totalFiles: 156,
  vulnerableFiles: 12,
  fileTree: {
    key: "/",
    title: "firmware",
    isVulnerable: false,
    children: [
      {
        key: "/bin",
        title: "bin",
        isVulnerable: false,
        children: [
          { key: "/bin/busybox", title: "busybox", isVulnerable: true },
          { key: "/bin/init", title: "init", isVulnerable: false }
        ]
      },
      {
        key: "/lib",
        title: "lib",
        isVulnerable: false,
        children: [
          { key: "/lib/libcurl.so", title: "libcurl.so", isVulnerable: true },
          { key: "/lib/libssl.so", title: "libssl.so", isVulnerable: true },
          { key: "/lib/ld-linux.so", title: "ld-linux.so", isVulnerable: false }
        ]
      },
      {
        key: "/etc",
        title: "etc",
        isVulnerable: false,
        children: [
          { key: "/etc/config", title: "config", isVulnerable: false },
          { key: "/etc/passwd", title: "passwd", isVulnerable: false }
        ]
      },
      {
        key: "/usr",
        title: "usr",
        isVulnerable: false,
        children: [
          { key: "/usr/bin", title: "bin", isVulnerable: false },
          { key: "/usr/lib", title: "lib", isVulnerable: false }
        ]
      },
      {
        key: "/var",
        title: "var",
        isVulnerable: false,
        children: [
          { key: "/var/log", title: "log", isVulnerable: false },
          { key: "/var/tmp", title: "tmp", isVulnerable: false }
        ]
      }
    ]
  }
};

export default function FirmwareTreePage() {
  const [mounted, setMounted] = useState(false);
  const [treeData, setTreeData] = useState<FirmwareTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['/', '/bin', '/lib', '/etc', '/usr', '/var']);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      setTreeData(mockTreeData);
      setLoading(false);
    }, 500);
  }, []);

  const transformToTreeData = (node: FileNode): DataNode => {
    const title = (
      <span>
        {node.isVulnerable && <Tag color="red" style={{ marginRight: 8 }}>VULN</Tag>}
        {node.title}
      </span>
    );
    return {
      key: node.key,
      title,
      children: node.children?.map(transformToTreeData)
    };
  };

  const filterTree = (node: FileNode, search: string): FileNode | null => {
    if (!search || node.title.toLowerCase().includes(search.toLowerCase())) {
      const filtered: FileNode = { ...node };
      if (node.children) {
        filtered.children = node.children
          .map(child => filterTree(child, search))
          .filter((child): child is FileNode => child !== null);
      }
      return filtered;
    }
    if (node.children) {
      const filteredChildren = node.children
        .map(child => filterTree(child, search))
        .filter((child): child is FileNode => child !== null);
      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
    }
    return null;
  };

  if (loading || !treeData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const filteredTree = searchValue ? filterTree(treeData.fileTree, searchValue) : treeData.fileTree;
  const treeNodes = filteredTree ? [transformToTreeData(filteredTree)] : [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Firmware File Tree</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>{treeData.projectName}</div>
              <div style={{ color: '#666' }}>Project</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{treeData.totalFiles}</div>
              <div style={{ color: '#666' }}>Total Files</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#cf1322' }}>{treeData.vulnerableFiles}</div>
              <div style={{ color: '#666' }}>Vulnerable Files</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="File Structure" extra={
        <Input
          placeholder="Search files..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      }>
        {mounted ? (
          <Tree
            showLine
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            treeData={treeNodes}
            height={500}
          />
        ) : (
          <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        )}
      </Card>

      <Card title="Legend" style={{ marginTop: 16 }}>
        <Tag color="red">VULN</Tag> - Contains known vulnerabilities
      </Card>
    </div>
  );
}
