# VulnVision - CVE 漏洞可视化分析平台

企业级漏洞管理可视化平台，支持 CVE/SBOM/固件漏洞数据的导入、分析和可视化展示。

## 功能特性

- **数据导入** - 支持上传 JSON 格式的 CVE 漏洞数据
- **数据看板** - 统计总览、风险分布、CWE Top10 等可视化图表
- **漏洞列表** - 支持按严重程度、攻击向量、组件等条件筛选
- **漏洞详情** - 展示 CVE 详细信息、风险评分、利用情况
- **组件分析** - 按组件统计漏洞数量和分布
- **CWE 统计** - 弱点类型统计分析
- **攻击面分析** - 按攻击向量（网络、本地、物理、邻接）分类展示
- **固件文件树** - 可视化展示固件文件结构中高危文件
- **优先级分类** - 按 P0/P1/P2/P3 优先级分类漏洞

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + TypeScript + TailwindCSS + ECharts + Ant Design |
| 后端 | FastAPI + SQLAlchemy |
| 数据库 | PostgreSQL + Redis |
| 搜索 | Elasticsearch |

## 项目结构

```
cve-visiable/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/            # 页面路由
│   │   │   ├── dashboard/  # 数据看板
│   │   │   ├── cves/       # 漏洞列表
│   │   │   ├── components/  # 组件分析
│   │   │   ├── cwes/       # CWE 统计
│   │   │   ├── attack-surface/  # 攻击面分析
│   │   │   ├── firmware/    # 固件文件树
│   │   │   ├── priorities/ # 优先级分类
│   │   │   └── import/    # 数据导入
│   │   ├── components/     # 可复用组件
│   │   ├── services/        # API 服务
│   │   └── types/           # TypeScript 类型
│   └── package.json
├── backend/                 # FastAPI 后端
│   ├── main.py              # 主入口
│   └── requirements.txt
├── data/                    # 示例数据
└── PLAN.md                  # 项目计划
```

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- npm 或 yarn

### 1. 克隆项目

```bash
cd cve-visiable
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

后端 API 可通过 http://localhost:8001 访问

### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 5. 启动前端服务

```bash
npm run dev
```

前端应用可通过 http://localhost:3000 访问

### 6. 导入数据

1. 打开 http://localhost:3000
2. 上传 JSON 格式的 CVE 数据文件
3. 点击 "Import CVEs" 导入数据
4. 导入成功后点击 "Go to Dashboard" 查看数据

## CVE 数据格式

支持以下 JSON 格式的 CVE 数据导入：

```json
[
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
]
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | CVE ID |
| title | string | 漏洞标题 |
| severity | string | 严重程度 (critical/high/medium/low) |
| risk | number | 风险评分 (0-100) |
| description | string | 漏洞描述 |
| component | object | 组件信息 (name, version) |
| cwes | array | CWE 弱点列表 |
| epssScore | number | EPSS 风险评分 |
| attackVector | string | 攻击向量 (NETWORK/LOCAL/PHYSICAL/ADJACENT_NETWORK) |
| inKev | boolean | 是否在 KEV 目录中 |
| exploitMaturity | string | 利用成熟度 (poc/未利用) |
| remediation | string | 修复建议 |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/dashboard` | GET | 获取仪表盘统计数据 |
| `/api/cves` | GET | 获取漏洞列表（支持分页、筛选） |
| `/api/cves/{cve_id}` | GET | 获取漏洞详情 |
| `/api/components` | GET | 获取组件列表 |
| `/api/cwes` | GET | 获取 CWE 统计数据 |
| `/api/attack-surface` | GET | 获取攻击面分析数据 |
| `/api/priorities` | GET | 获取优先级分类数据 |
| `/api/import/cves` | POST | 导入 CVE 数据 |
| `/api/import/progress` | GET | 获取导入进度 |

## 开发指南

### 构建生产版本

```bash
cd frontend
npm run build
```

### 运行生产版本

```bash
npm start
```

## 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License
