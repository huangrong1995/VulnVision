# CVE 可视化平台项目计划

**项目名称**: VulnVision - CVE 漏洞可视化分析平台
**创建日期**: 2026-05-11
**基于**: finitestate-cves.json 漏洞数据结构

---

## 一、项目概述

### 1.1 项目目标
构建一个企业级漏洞管理可视化平台，支持 CVE/SBOM/固件漏洞数据的导入、分析和可视化展示。

### 1.2 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | Next.js + TypeScript + TailwindCSS + ECharts |
| 后端 | FastAPI + SQLAlchemy |
| 数据库 | PostgreSQL + Redis |
| 搜索 | Elasticsearch |

### 1.3 核心功能模块
1. JSON 漏洞数据导入
2. Dashboard 总览
3. 漏洞列表与搜索
4. 漏洞详情页
5. 组件分析
6. CWE 统计分析
7. 固件文件树可视化
8. 攻击面分析
9. 风险优先级引擎

---

## 二、开发阶段计划

### Phase 1: 项目基础搭建

#### Task 1.1: 项目结构初始化
- [ ] 创建前端 Next.js 项目
- [ ] 创建后端 FastAPI 项目
- [ ] 配置 TypeScript
- [ ] 配置 TailwindCSS
- [ ] 配置 eslint/prettier
- [ ] 验证开发服务器启动

#### Task 1.2: 后端基础架构
- [ ] 配置 PostgreSQL 数据库连接
- [ ] 创建数据库模型（Component, CVE, Project, ProjectVersion）
- [ ] 配置 Redis 缓存
- [ ] 创建基础 API 路由结构
- [ ] 验证 API 端点

#### Task 1.3: 数据导入模块
- [ ] 实现 JSON 文件解析器
- [ ] 实现 CVE 数据标准化
- [ ] 实现批量导入接口
- [ ] 创建数据验证逻辑
- [ ] 测试导入功能

### Phase 2: 前端核心功能

#### Task 2.1: Dashboard 页面
- [ ] 创建统计卡片组件（总漏洞数、高危数、Critical数）
- [ ] 实现 EPSS 风险分布图表
- [ ] 实现 Severity 分布饼图
- [ ] 实现 CWE Top10 柱状图
- [ ] 实现时间趋势折线图
- [ ] 测试 Dashboard 功能

#### Task 2.2: 漏洞列表页
- [ ] 创建漏洞表格组件
- [ ] 实现分页功能
- [ ] 实现排序功能（severity, risk, epssScore）
- [ ] 实现过滤功能（severity, attackVector, component）
- [ ] 实现全文搜索
- [ ] 测试列表页功能

#### Task 2.3: 漏洞详情页
- [ ] 创建基础信息展示组件
- [ ] 创建 CWE 分析组件
- [ ] 创建 EPSS 风险仪表盘
- [ ] 创建 Exploit 分析组件
- [ ] 创建修复建议组件
- [ ] 测试详情页功能

### Phase 3: 高级功能

#### Task 3.1: 组件分析模块
- [ ] 实现组件统计 API
- [ ] 创建组件列表页面
- [ ] 创建组件漏洞详情
- [ ] 测试组件分析功能

#### Task 3.2: CWE 统计分析
- [ ] 实现 CWE 聚合 API
- [ ] 创建 CWE 统计图表
- [ ] 创建 CWE 详情页面
- [ ] 测试 CWE 统计功能

#### Task 3.3: 固件文件树可视化
- [ ] 实现文件路径解析
- [ ] 创建树状结构组件
- [ ] 实现漏洞高亮
- [ ] 测试文件树功能

#### Task 3.4: 攻击面分析
- [ ] 实现攻击向量统计
- [ ] 创建攻击面概览图
- [ ] 创建网络/本地/物理漏洞列表
- [ ] 测试攻击面功能

#### Task 3.5: 风险优先级引擎
- [ ] 实现风险评分算法
- [ ] 实现 P0/P1/P2/P3 优先级分类
- [ ] 创建优先级看板
- [ ] 测试优先级功能

### Phase 4: 优化与集成

#### Task 4.1: 性能优化
- [ ] 实现 Redis 缓存
- [ ] 优化数据库查询
- [ ] 实现虚拟滚动
- [ ] 测试性能

#### Task 4.2: API 集成
- [ ] 实现导入进度查询
- [ ] 实现导出功能（PDF/Excel）
- [ ] 测试集成功能

---

## 三、验收标准

### 每完成一个 Task 必须：
1. 代码编译通过（无语法错误）
2. 单元测试通过
3. 手动功能测试通过
4. 更新 Task 完成状态

### Phase 验收：
- Phase 1: 前后端服务正常启动，API 可访问
- Phase 2: Dashboard 可显示模拟数据，列表页可正常加载
- Phase 3: 所有高级功能可用
- Phase 4: 性能达标，功能完整

---

## 四、当前进度

| Phase | Task | 状态 |
|-------|------|------|
| 1.1 | 项目结构初始化 | ✅ Completed |
| 1.2 | 后端基础架构 | ✅ Completed |
| 1.3 | 数据导入模块 | ✅ Completed |
| 2.1 | Dashboard 页面 | ✅ Completed |
| 2.2 | 漏洞列表页 | ✅ Completed |
| 2.3 | 漏洞详情页 | ✅ Completed |
| 3.1 | 组件分析模块 | ✅ Completed |
| 3.2 | CWE 统计分析 | ✅ Completed |
| 3.3 | 固件文件树可视化 | ✅ Completed |
| 3.4 | 攻击面分析 | ✅ Completed |
| 3.5 | 风险优先级引擎 | ✅ Completed |
| 4.1 | 性能优化 | Completed |
| 4.2 | API 集成 | ✅ Completed |

---

## 五、目录结构

```
cve-visiable/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── parsers/
│   │   └── utils/
│   ├── requirements.txt
│   └── main.py
├── data/                    # 示例数据
├── docs/                     # 文档
└── PLAN.md                   # 本计划文件
```