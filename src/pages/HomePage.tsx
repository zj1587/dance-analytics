import { Button, Space, Steps, Table, Tag, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOpenText,
  CheckCircle2,
  Copy,
  FileText,
  Layers3,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import { productMenuDocs, type ProductMenuDoc } from "../data/productDocs";
import "./Page.css";

type QuickAction = {
  key: string;
  title: string;
  description: string;
  buttonLabel: string;
  tag: string;
  prompt: string;
};

type Capability = {
  key: string;
  title: string;
  description: string;
  status: "已内置" | "按项目配置";
  icon: LucideIcon;
};

const quickActions: QuickAction[] = [
  {
    key: "init",
    title: "初始化项目",
    description: "告诉我业务背景、评审对象和要验证的流程方案，其余配置我来同步。",
    buttonLabel: "复制初始化提示词",
    tag: "第一步",
    prompt:
      "请使用本项目的 prototype-agent skill，把这个模板初始化为【项目名称】原型。这个原型给【用户/评审对象】评审，主要验证【业务目标/流程方案】。如果信息不足，请先问我最少需要确认的问题；确认后请更新项目名称、访问页、首页说明、PRD 和文档入口，最后运行 npm run build。",
  },
  {
    key: "module",
    title: "落地业务页面",
    description: "说清角色、任务、字段、操作和规则，我会先补 PRD，再做页面。",
    buttonLabel: "复制模块提示词",
    tag: "核心工作",
    prompt:
      "请使用本项目的 prototype-agent skill，新增【模块名称】业务模块。使用者是【角色】，他们需要完成【任务】，页面需要看到【关键信息】，可以执行【操作】，关键规则是【状态/权限/校验/审批规则】。请先整理 PRD，再做可评审页面，并在完成后运行 npm run build。",
  },
  {
    key: "check",
    title: "交付前检查",
    description: "检查页面、文档入口、PRD、规则口径和构建结果是否适合评审。",
    buttonLabel: "复制检查提示词",
    tag: "交付前",
    prompt:
      "请使用本项目的 prototype-agent skill，对当前原型做发布前检查。请确认页面是否可访问、顶部文档入口是否正确、PRD 是否同步、UI 规范是否遵守、npm run build 是否通过。如发现问题，请直接修复并说明修改内容。",
  },
];

const capabilities: Capability[] = [
  {
    key: "prd",
    title: "沉淀评审口径",
    description: "把业务目标拆成角色、字段、操作、规则、状态和验收标准。",
    status: "已内置",
    icon: FileText,
  },
  {
    key: "ui",
    title: "生成可评审页面",
    description: "按任务语义组合表格、表单、抽屉、状态和反馈，形成后台原型。",
    status: "已内置",
    icon: Layers3,
  },
  {
    key: "docs",
    title: "绑定页面与说明",
    description: "让顶部文档入口能打开当前页面 PRD、规则说明、UI 规范和部署指南。",
    status: "已内置",
    icon: BookOpenText,
  },
  {
    key: "deploy",
    title: "准备评审链接",
    description: "检查构建结果，整理 GitHub、Vercel、访问码环境变量和可选自有域名配置。",
    status: "按项目配置",
    icon: Rocket,
  },
];

const deliverySteps = [
  {
    title: "明确业务目标",
    description: "给出项目名称、评审对象和要验证的流程或管理问题。",
  },
  {
    title: "定义页面范围",
    description: "说明使用角色、核心任务、页面字段、操作、状态和规则。",
  },
  {
    title: "同步 PRD 与页面",
    description: "补齐需求说明、页面实现、菜单、文档入口和业务规则。",
  },
  {
    title: "验证并准备发布",
    description: "运行 npm run build，通过后再准备 GitHub 与 Vercel 预览。",
  },
];

const copyPrompt = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => message.success("已复制到剪贴板"),
    () => message.error("复制失败，请手动复制"),
  );
};

const inputColumns: ColumnsType<{ item: string; provide: string; example: string; status: string }> = [
  { title: "信息项", dataIndex: "item", key: "item", width: 120 },
  { title: "需要提供", dataIndex: "provide", key: "provide", minWidth: 220 },
  { title: "示例", dataIndex: "example", key: "example", minWidth: 300 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 80,
    render: (status: string) => <Tag color={status === "必填" ? "red" : "default"}>{status}</Tag>,
  },
];

const productDocColumns: ColumnsType<ProductMenuDoc> = [
  { title: "菜单", dataIndex: "menu", key: "menu", width: 130 },
  { title: "路由", dataIndex: "route", key: "route", width: 180 },
  { title: "PRD", dataIndex: "documentPath", key: "documentPath", minWidth: 320 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: ProductMenuDoc["status"]) => (
      <Tag color={status === "持续迭代" ? "blue" : "green"}>{status}</Tag>
    ),
  },
  { title: "更新日期", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
];

export function HomePage() {
  return (
    <main className="page home-page">
      <PageHeader
        title="舞蹈课时统计分析系统"
        description="面向业务（舞蹈课时记录用户）与产品评审，验证主数据配置、课时记录流程、数据分析流程。"
        actions={
          <Space wrap>
            <Tooltip title="复制项目初始化提示词">
              <Button icon={<Copy size={14} />} onClick={() => copyPrompt(quickActions[0].prompt)} type="primary">
                初始化项目
              </Button>
            </Tooltip>
          </Space>
        }
      />

      <section className="home-hero" aria-label="系统概览">
        <div className="home-hero__content">
          <Tag color="blue">ToB 后台原型</Tag>
          <h2>舞蹈课时统计分析系统</h2>
          <p>
            覆盖主数据配置、课时记录、数据分析三个核心模块。面向舞蹈培训机构业务用户与产品评审，验证课时管理全流程的业务方案与交互设计。
          </p>
          <Space wrap size={10}>
            <Button icon={<Copy size={14} />} onClick={() => copyPrompt(quickActions[1].prompt)} type="primary">
              新增业务模块
            </Button>
            <Button icon={<CheckCircle2 size={14} />} onClick={() => copyPrompt(quickActions[2].prompt)}>
              交付前检查
            </Button>
          </Space>
        </div>
        <div className="home-hero__facts" aria-label="系统关键信息">
          <div className="home-fact">
            <span>适用场景</span>
            <strong>舞蹈培训机构管理</strong>
          </div>
          <div className="home-fact">
            <span>协作方式</span>
            <strong>PRD + 页面</strong>
          </div>
          <div className="home-fact">
            <span>发布路径</span>
            <strong>GitHub + Vercel</strong>
          </div>
        </div>
      </section>

      <SectionPanel title="从这里开始">
        <div className="home-action-grid">
          {quickActions.map((action) => (
            <article className="home-action" key={action.key}>
              <div className="home-action__header">
                <Tag color={action.key === "module" ? "blue" : "default"}>{action.tag}</Tag>
                <h3>{action.title}</h3>
              </div>
              <p>{action.description}</p>
              <Button icon={<Copy size={14} />} onClick={() => copyPrompt(action.prompt)}>
                {action.buttonLabel}
              </Button>
            </article>
          ))}
        </div>
      </SectionPanel>

      <div className="home-dashboard-grid">
        <SectionPanel title="交付路径">
          <Steps current={0} direction="vertical" items={deliverySteps} />
        </SectionPanel>

        <SectionPanel title="我可以帮你做什么">
          <div className="home-capability-grid">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <article className="home-capability" key={capability.key}>
                  <div className="home-capability__icon" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <div className="home-capability__content">
                    <div className="home-capability__title">
                      <h3>{capability.title}</h3>
                      <Tag color={capability.status === "已内置" ? "green" : "gold"}>{capability.status}</Tag>
                    </div>
                    <p>{capability.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionPanel>
      </div>

      <SectionPanel title="产品经理需要提供的信息">
        <Table columns={inputColumns} dataSource={[
          { item: "业务目标", provide: "项目名称、业务背景、评审对象", example: "舞蹈课时统计分析系统，给业务（课时记录员）与产品评审，验证主数据配置、课时记录、数据分析流程", status: "必填" },
          { item: "页面范围", provide: "模块名称、使用角色、核心任务", example: "主数据配置、课时记录、数据分析；课时记录员负责登记，教学主管负责审核与分析", status: "必填" },
          { item: "规则口径", provide: "字段、操作、状态、权限、校验", example: "课时数1-4；同一教师同日同时段不可重复登记；核销不可逆", status: "可选" },
          { item: "评审意见", provide: "已有反馈或待定事项", example: "课时单价是否按舞种或教师维度分别计算？待定", status: "可选" },
        ]} pagination={false} rowKey="item" scroll={{ x: 920 }} />
      </SectionPanel>

      <SectionPanel title="文档入口">
        <Table
          columns={productDocColumns}
          dataSource={productMenuDocs}
          pagination={false}
          rowKey="route"
          scroll={{ x: 820 }}
        />
      </SectionPanel>
    </main>
  );
}

