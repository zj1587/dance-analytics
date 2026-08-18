import { Button, DatePicker, Drawer, Descriptions, Empty, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Download } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import "./Page.css";

type TeacherStat = { id: string; name: string; totalHours: number; consumedHours: number; pendingHours: number; consumeRate: string; avgPrice: number; lastUpdate: string };
type StudentStat = { id: string; name: string; danceType: string; totalHours: number; lastClassDate: string; pendingHours: number; weeklyAvg: string };
type DanceTypeStat = { id: string; name: string; hours: number; share: string; trend: string; trendDir: "up" | "down" | "flat" };

const teacherData: TeacherStat[] = [
  { id: "1", name: "张悦", totalHours: 128, consumedHours: 120, pendingHours: 8, consumeRate: "93.8%", avgPrice: 200, lastUpdate: "2026-08-17" },
  { id: "2", name: "李航", totalHours: 96, consumedHours: 88, pendingHours: 8, consumeRate: "91.7%", avgPrice: 150, lastUpdate: "2026-08-17" },
  { id: "3", name: "王芳", totalHours: 64, consumedHours: 60, pendingHours: 4, consumeRate: "93.8%", avgPrice: 200, lastUpdate: "2026-08-15" },
];

const studentData: StudentStat[] = [
  { id: "1", name: "陈小雨", danceType: "芭蕾", totalHours: 48, lastClassDate: "2026-08-17", pendingHours: 3, weeklyAvg: "2.1" },
  { id: "2", name: "刘子涵", danceType: "街舞", totalHours: 24, lastClassDate: "2026-08-16", pendingHours: 2, weeklyAvg: "1.8" },
  { id: "3", name: "赵思琪", danceType: "中国古典舞", totalHours: 60, lastClassDate: "2026-08-14", pendingHours: 0, weeklyAvg: "2.5" },
  { id: "4", name: "孙悦", danceType: "芭蕾", totalHours: 36, lastClassDate: "2026-08-15", pendingHours: 1, weeklyAvg: "1.5" },
];

const danceTypeData: DanceTypeStat[] = [
  { id: "1", name: "芭蕾", hours: 256, share: "38.5%", trend: "+12", trendDir: "up" },
  { id: "2", name: "街舞", hours: 192, share: "28.9%", trend: "+8", trendDir: "up" },
  { id: "3", name: "中国古典舞", hours: 144, share: "21.7%", trend: "-3", trendDir: "down" },
  { id: "4", name: "爵士舞", hours: 64, share: "9.6%", trend: "0", trendDir: "flat" },
];

const maxHours = Math.max(...danceTypeData.map((d) => d.hours));

function BarChart({ data }: { data: DanceTypeStat[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "0 8px" }}>
      {data.map((d) => {
        const height = maxHours > 0 ? (d.hours / maxHours) * 160 : 0;
        return (
          <div key={d.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 600 }}>{d.hours}</span>
            <div
              style={{
                width: "60%",
                height,
                borderRadius: "4px 4px 0 0",
                background: d.trendDir === "up" ? "linear-gradient(180deg, #3b82f6, #60a5fa)" : d.trendDir === "down" ? "linear-gradient(180deg, #f97316, #fb923c)" : "#94a3b8",
                minHeight: 4,
              }}
            />
            <span style={{ fontSize: 12, color: "var(--color-text)", whiteSpace: "nowrap" }}>{d.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalysisPage() {
  const [teacherDrawerOpen, setTeacherDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStat | null>(null);
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentStat | null>(null);

  const handleExport = () => message.success("导出成功，文件已开始下载");

  const teacherDetailColumns: ColumnsType<{ date: string; timeSlot: string; student: string; hours: number; status: string }> = [
    { title: "上课日期", dataIndex: "date", key: "date", width: 130 },
    { title: "上课时段", dataIndex: "timeSlot", key: "timeSlot", width: 130 },
    { title: "学员", dataIndex: "student", key: "student", width: 100 },
    { title: "课时数", dataIndex: "hours", key: "hours", width: 80, align: "right" },
    {
      title: "状态", dataIndex: "status", key: "status", width: 90,
      render: (v: string) => <Tag color={v === "已核销" ? "green" : "gold"}>{v}</Tag>,
    },
  ];

  const teacherDetailData = [
    { date: "2026-08-17", timeSlot: "09:00-10:30", student: "陈小雨", hours: 1, status: "已核销" },
    { date: "2026-08-16", timeSlot: "10:45-12:15", student: "刘子涵", hours: 2, status: "已核销" },
    { date: "2026-08-15", timeSlot: "14:00-15:30", student: "陈小雨", hours: 1, status: "待核销" },
  ];

  const studentDetailColumns: ColumnsType<{ date: string; timeSlot: string; teacher: string; hours: number; status: string }> = [
    { title: "上课日期", dataIndex: "date", key: "date", width: 130 },
    { title: "上课时段", dataIndex: "timeSlot", key: "timeSlot", width: 130 },
    { title: "教师", dataIndex: "teacher", key: "teacher", width: 100 },
    { title: "课时数", dataIndex: "hours", key: "hours", width: 80, align: "right" },
    {
      title: "状态", dataIndex: "status", key: "status", width: 90,
      render: (v: string) => <Tag color={v === "已核销" ? "green" : "gold"}>{v}</Tag>,
    },
  ];

  const studentDetailData = [
    { date: "2026-08-17", timeSlot: "09:00-10:30", teacher: "张悦", hours: 1, status: "已核销" },
    { date: "2026-08-15", timeSlot: "14:00-15:30", teacher: "张悦", hours: 1, status: "已核销" },
    { date: "2026-08-14", timeSlot: "16:00-17:30", teacher: "李航", hours: 2, status: "待核销" },
  ];

  const teacherColumns: ColumnsType<TeacherStat> = [
    { title: "教师姓名", dataIndex: "name", key: "name", width: 120 },
    { title: "总课时", dataIndex: "totalHours", key: "totalHours", width: 100, align: "right" },
    { title: "已核销", dataIndex: "consumedHours", key: "consumedHours", width: 100, align: "right" },
    { title: "待核销", dataIndex: "pendingHours", key: "pendingHours", width: 100, align: "right" },
    { title: "核销率", dataIndex: "consumeRate", key: "consumeRate", width: 100, align: "right" },
    { title: "平均单价（元）", dataIndex: "avgPrice", key: "avgPrice", width: 130, align: "right" },
    { title: "最近更新", dataIndex: "lastUpdate", key: "lastUpdate", width: 130 },
    {
      title: "操作", key: "action", width: 100,
      render: (_, record) => (
        <TableActions actions={[
          { key: "detail", label: "查看详情", onClick: () => { setSelectedTeacher(record); setTeacherDrawerOpen(true); }, },
        ]} />
      ),
    },
  ];

  const studentColumns: ColumnsType<StudentStat> = [
    { title: "学员姓名", dataIndex: "name", key: "name", width: 120 },
    { title: "绑定舞种", dataIndex: "danceType", key: "danceType", width: 130 },
    { title: "累计课时", dataIndex: "totalHours", key: "totalHours", width: 100, align: "right" },
    { title: "最近上课", dataIndex: "lastClassDate", key: "lastClassDate", width: 130 },
    { title: "待核销", dataIndex: "pendingHours", key: "pendingHours", width: 100, align: "right" },
    { title: "周均课时", dataIndex: "weeklyAvg", key: "weeklyAvg", width: 100, align: "right" },
    {
      title: "操作", key: "action", width: 100,
      render: (_, record) => (
        <TableActions actions={[
          { key: "detail", label: "查看详情", onClick: () => { setSelectedStudent(record); setStudentDrawerOpen(true); }, },
        ]} />
      ),
    },
  ];

  const danceTypeColumns: ColumnsType<DanceTypeStat> = [
    { title: "舞种", dataIndex: "name", key: "name", width: 130 },
    { title: "课时数", dataIndex: "hours", key: "hours", width: 100, align: "right" },
    { title: "占比", dataIndex: "share", key: "share", width: 100, align: "right" },
    {
      title: "较上月", dataIndex: "trend", key: "trend", width: 100, align: "right",
      render: (v: string, record: DanceTypeStat) => (
        <span style={{ color: record.trendDir === "up" ? "#16a34a" : record.trendDir === "down" ? "#ea580c" : "var(--color-text-secondary)" }}>
          {record.trendDir === "up" ? "↑" : record.trendDir === "down" ? "↓" : "—"} {v}
        </span>
      ),
    },
  ];

  return (
    <main className="page">
      <PageHeader
        title="数据分析"
        description="多维度课时统计与可视化分析，支持教师、学员、舞种三个视角的数据洞察。"
        actions={
          <Button icon={<Download size={14} />} onClick={handleExport}>
            导出统计
          </Button>
        }
      />

      <SectionPanel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
          {[
            { label: "当月总课时", value: "664", sub: "较上月 +12.3%" },
            { label: "已核销课时", value: "588", sub: "核销率 88.6%" },
            { label: "待核销课时", value: "76", sub: "涉及 23 条记录" },
            { label: "平均课时单价", value: "178元", sub: "按舞种加权" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                padding: "18px 20px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel
        title="分析详情"
        actions={
          <Space wrap>
            <Select allowClear placeholder="舞种" mode="multiple" style={{ width: 160 }} options={[
              { label: "芭蕾", value: "芭蕾" },
              { label: "街舞", value: "街舞" },
              { label: "中国古典舞", value: "中国古典舞" },
              { label: "爵士舞", value: "爵士舞" },
            ]} />
            <DatePicker.RangePicker size="small" />
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="teacher"
          items={[
            {
              key: "teacher",
              label: "教师课时分析",
              children: teacherData.length > 0 ? (
                <Table<TeacherStat> columns={teacherColumns} dataSource={teacherData} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
              ) : (
                <Empty description="暂无教师课时数据" />
              ),
            },
            {
              key: "student",
              label: "学员课时分析",
              children: studentData.length > 0 ? (
                <Table<StudentStat> columns={studentColumns} dataSource={studentData} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
              ) : (
                <Empty description="暂无学员课时数据" />
              ),
            },
            {
              key: "dance-type",
              label: "舞种课时分布",
              children: (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                  <div>
                    <BarChart data={danceTypeData} />
                  </div>
                  <div>
                    <Table<DanceTypeStat> columns={danceTypeColumns} dataSource={danceTypeData} rowKey="id" pagination={false} />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </SectionPanel>

      <Drawer
        title={`教师详情 — ${selectedTeacher?.name ?? ""}`}
        open={teacherDrawerOpen}
        onClose={() => setTeacherDrawerOpen(false)}
        width={640}
      >
        {selectedTeacher && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="总课时">{selectedTeacher.totalHours}</Descriptions.Item>
              <Descriptions.Item label="已核销">{selectedTeacher.consumedHours}</Descriptions.Item>
              <Descriptions.Item label="待核销">{selectedTeacher.pendingHours}</Descriptions.Item>
              <Descriptions.Item label="核销率">{selectedTeacher.consumeRate}</Descriptions.Item>
              <Descriptions.Item label="平均单价">{selectedTeacher.avgPrice}元</Descriptions.Item>
              <Descriptions.Item label="最近更新">{selectedTeacher.lastUpdate}</Descriptions.Item>
            </Descriptions>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--color-text)" }}>课时明细</div>
            <Table<{ date: string; timeSlot: string; student: string; hours: number; status: string }>
              columns={teacherDetailColumns}
              dataSource={teacherDetailData}
              rowKey="date"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Drawer>

      <Drawer
        title={`学员详情 — ${selectedStudent?.name ?? ""}`}
        open={studentDrawerOpen}
        onClose={() => setStudentDrawerOpen(false)}
        width={640}
      >
        {selectedStudent && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="绑定舞种">{selectedStudent.danceType}</Descriptions.Item>
              <Descriptions.Item label="累计课时">{selectedStudent.totalHours}</Descriptions.Item>
              <Descriptions.Item label="待核销">{selectedStudent.pendingHours}</Descriptions.Item>
              <Descriptions.Item label="周均课时">{selectedStudent.weeklyAvg}</Descriptions.Item>
              <Descriptions.Item label="最近上课">{selectedStudent.lastClassDate}</Descriptions.Item>
            </Descriptions>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--color-text)" }}>课时明细</div>
            <Table<{ date: string; timeSlot: string; teacher: string; hours: number; status: string }>
              columns={studentDetailColumns}
              dataSource={studentDetailData}
              rowKey="date"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Drawer>
    </main>
  );
}
