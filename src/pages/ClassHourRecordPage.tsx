import { Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Download, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import "./Page.css";

type RecordStatus = "pending" | "consumed" | "adjusted" | "voided";

type ClassHourRecord = {
  id: string;
  date: string;
  timeSlot: string;
  teacher: string;
  student: string;
  danceType: string;
  hours: number;
  status: RecordStatus;
  createdAt: string;
  remark?: string;
};

const statusMeta: Record<RecordStatus, { color: string; label: string }> = {
  pending: { color: "gold", label: "待核销" },
  consumed: { color: "green", label: "已核销" },
  adjusted: { color: "blue", label: "已调整" },
  voided: { color: "default", label: "已作废" },
};

const danceTypeOptions = ["芭蕾", "街舞", "中国古典舞", "爵士舞", "现代舞"].map((v) => ({ label: v, value: v }));
const teacherOptions = ["张悦", "李航", "王芳"].map((v) => ({ label: v, value: v }));
const studentOptions = ["陈小雨", "刘子涵", "赵思琪"].map((v) => ({ label: v, value: v }));
const timeSlotOptions = ["09:00-10:30", "10:45-12:15", "14:00-15:30", "16:00-17:30", "18:30-20:00"];

export function ClassHourRecordPage() {
  const [records, setRecords] = useState<ClassHourRecord[]>([
    { id: "DH20260815001", date: "2026-08-15", timeSlot: "09:00-10:30", teacher: "张悦", student: "陈小雨", danceType: "芭蕾", hours: 1, status: "consumed", createdAt: "2026-08-15 09:00" },
    { id: "DH20260815002", date: "2026-08-15", timeSlot: "14:00-15:30", teacher: "李航", student: "刘子涵", danceType: "街舞", hours: 2, status: "pending", createdAt: "2026-08-15 14:00", remark: "加课" },
    { id: "DH20260816001", date: "2026-08-16", timeSlot: "10:45-12:15", teacher: "张悦", student: "陈小雨", danceType: "芭蕾", hours: 1, status: "pending", createdAt: "2026-08-16 10:45" },
    { id: "DH20260816002", date: "2026-08-16", timeSlot: "16:00-17:30", teacher: "李航", student: "赵思琪", danceType: "街舞", hours: 1, status: "adjusted", createdAt: "2026-08-16 16:00", remark: "调课" },
    { id: "DH20260817001", date: "2026-08-17", timeSlot: "09:00-10:30", teacher: "张悦", student: "刘子涵", danceType: "芭蕾", hours: 1, status: "pending", createdAt: "2026-08-17 09:00" },
  ]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm] = Form.useForm();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm] = Form.useForm();
  const [adjustRecord, setAdjustRecord] = useState<ClassHourRecord | null>(null);

  const openRegister = () => { registerForm.resetFields(); setRegisterOpen(true); };

  const handleRegister = async () => {
    const values = await registerForm.validateFields();
    const exists = records.find(
      (r) => r.teacher === values.teacher && r.student === values.student && r.date === values.date && r.timeSlot === values.timeSlot && r.status !== "voided",
    );
    if (exists) {
      message.error("该教师在该日期和时段已有记录，请更换时段或教师。");
      return;
    }
    const newRecord: ClassHourRecord = {
      id: `DH${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(records.length + 1).padStart(3, "0")}`,
      date: values.date,
      timeSlot: values.timeSlot,
      teacher: values.teacher,
      student: values.student,
      danceType: values.danceType,
      hours: values.hours,
      status: "pending",
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }).slice(0, 16),
      remark: values.remark,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setRegisterOpen(false);
    message.success("课时登记成功，状态：待核销");
  };

  const handleConsume = (record: ClassHourRecord) => {
    Modal.confirm({
      title: "确认核销",
      content: `确认核销记录 ${record.id} 的课时？核销后不可撤销。`,
      okType: "danger",
      okText: "确认核销",
      cancelText: "取消",
      onOk() {
        setRecords((prev) => prev.map((r) => r.id === record.id ? { ...r, status: "consumed" as RecordStatus } : r));
        message.success("核销成功");
      },
    });
  };

  const openAdjust = (record: ClassHourRecord) => {
    setAdjustRecord(record);
    adjustForm.setFieldsValue({ newHours: record.hours, reason: "" });
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    const values = await adjustForm.validateFields();
    if (adjustRecord) {
      const diff = Math.abs(values.newHours - adjustRecord.hours);
      if (diff > 2 && !values.reason) {
        message.error("调整幅度超过 2 课时，请填写调整原因。");
        return;
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === adjustRecord.id
            ? { ...r, hours: values.newHours, status: "adjusted" as RecordStatus, remark: values.reason || r.remark }
            : r,
        ),
      );
      setAdjustOpen(false);
      message.success("课时调整成功");
    }
  };

  const handleVoid = (record: ClassHourRecord) => {
    Modal.confirm({
      title: "确认作废",
      content: `作废记录 ${record.id}？该记录将不再参与数据分析。`,
      okType: "danger",
      onOk() {
        setRecords((prev) => prev.map((r) => r.id === record.id ? { ...r, status: "voided" as RecordStatus } : r));
        message.success("已作废");
      },
    });
  };

  const recordColumns: ColumnsType<ClassHourRecord> = [
    { title: "记录编号", dataIndex: "id", key: "id", width: 160 },
    { title: "上课日期", dataIndex: "date", key: "date", width: 120 },
    { title: "上课时段", dataIndex: "timeSlot", key: "timeSlot", width: 130 },
    { title: "教师", dataIndex: "teacher", key: "teacher", width: 100 },
    { title: "学员", dataIndex: "student", key: "student", width: 100 },
    { title: "舞种", dataIndex: "danceType", key: "danceType", width: 100 },
    { title: "课时数", dataIndex: "hours", key: "hours", width: 80, align: "right" },
    {
      title: "状态", dataIndex: "status", key: "status", width: 100,
      render: (v: RecordStatus) => <Tag color={statusMeta[v].color}>{statusMeta[v].label}</Tag>,
    },
    { title: "登记时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
    {
      title: "操作", key: "action", width: 180,
      render: (_, record) => {
        const actions = [
          { key: "consume", label: "核销", disabled: record.status !== "pending", onClick: () => handleConsume(record) },
          { key: "adjust", label: "调整", disabled: record.status === "voided", onClick: () => openAdjust(record) },
          { key: "void", label: "作废", disabled: record.status === "voided", danger: true, onClick: () => handleVoid(record) },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <main className="page">
      <PageHeader
        title="课时记录"
        description="登记、核销、调整课时记录，批量导入支持，为数据分析提供可靠数据源。"
        actions={
          <Space>
            <Tooltip title="下载导入模板">
              <Button icon={<Download size={14} />} onClick={() => message.info("模板下载功能开发中")}>
                下载模板
              </Button>
            </Tooltip>
            <Tooltip title="批量导入课时记录">
              <Button icon={<Upload size={14} />} onClick={() => message.info("批量导入功能开发中")}>
                批量导入
              </Button>
            </Tooltip>
            <Button icon={<Plus size={14} />} onClick={openRegister} type="primary">
              登记课时
            </Button>
          </Space>
        }
      />

      <SectionPanel
        title="课时记录列表"
        actions={
          <Space wrap>
            <Select allowClear placeholder="教师" style={{ width: 120 }} options={teacherOptions} />
            <Select allowClear placeholder="舞种" style={{ width: 120 }} options={danceTypeOptions} />
            <Select allowClear placeholder="状态" style={{ width: 110 }} options={[
              { label: "待核销", value: "pending" },
              { label: "已核销", value: "consumed" },
              { label: "已调整", value: "adjusted" },
              { label: "已作废", value: "voided" },
            ]} />
            <DatePicker.RangePicker size="small" />
            <Button size="small">查询</Button>
            <Button size="small">重置</Button>
          </Space>
        }
      >
        <Table<ClassHourRecord> columns={recordColumns} dataSource={records} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} />
      </SectionPanel>

      <Drawer
        title="登记课时"
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        width={480}
        footer={
          <Space>
            <Button onClick={() => setRegisterOpen(false)}>取消</Button>
            <Button onClick={handleRegister} type="primary">提交登记</Button>
          </Space>
        }
      >
        <Form form={registerForm} layout="vertical">
          <Form.Item label="教师" name="teacher" rules={[{ required: true, message: "请选择教师" }]}>
            <Select placeholder="请选择教师" options={teacherOptions} />
          </Form.Item>
          <Form.Item label="学员" name="student" rules={[{ required: true, message: "请选择学员" }]}>
            <Select placeholder="请选择学员" options={studentOptions} />
          </Form.Item>
          <Form.Item label="舞种" name="danceType" rules={[{ required: true, message: "请选择舞种" }]}>
            <Select placeholder="请选择舞种" options={danceTypeOptions} />
          </Form.Item>
          <Form.Item label="上课日期" name="date" rules={[{ required: true, message: "请选择日期" }]}>
            <DatePicker style={{ width: "100%" }} placeholder="请选择上课日期" />
          </Form.Item>
          <Form.Item label="上课时段" name="timeSlot" rules={[{ required: true, message: "请选择时段" }]}>
            <Select placeholder="请选择上课时段" options={timeSlotOptions.map((v) => ({ label: v, value: v }))} />
          </Form.Item>
          <Form.Item label="课时数" name="hours" rules={[{ required: true, message: "请输入课时数" }, { type: "number", min: 1, max: 4, message: "课时数为 1-4 的正整数" }]}>
            <InputNumber min={1} max={4} style={{ width: "100%" }} placeholder="1-4 课时" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="可选补充说明" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="调整课时"
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        width={480}
        footer={
          <Space>
            <Button onClick={() => setAdjustOpen(false)}>取消</Button>
            <Button onClick={handleAdjust} type="primary">确认调整</Button>
          </Space>
        }
      >
        <Form form={adjustForm} layout="vertical">
          {adjustRecord && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 13, color: "var(--color-text-secondary)" }}>
              原记录：<strong>{adjustRecord.teacher}</strong> × <strong>{adjustRecord.student}</strong>，{" "}
              {adjustRecord.date} {adjustRecord.timeSlot}，课时 <strong>{adjustRecord.hours}</strong>
            </div>
          )}
          <Form.Item label="新课时数" name="newHours" rules={[{ required: true, message: "请输入新课时数" }, { type: "number", min: 1, max: 4, message: "课时数为 1-4 的正整数" }]}>
            <InputNumber min={1} max={4} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="调整原因" name="reason">
            <Input.TextArea rows={2} placeholder="调整幅度超过 2 课时时必填" />
          </Form.Item>
        </Form>
      </Drawer>
    </main>
  );
}



