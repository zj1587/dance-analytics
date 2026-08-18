import { Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import "./Page.css";

type DanceType = { id: string; name: string; category: string; price: number; enabled: boolean; updatedAt: string };
type Teacher = { id: string; name: string; phone: string; danceTypes: string[]; joinDate: string; enabled: boolean; updatedAt: string };
type Student = { id: string; name: string; phone: string; danceType: string; totalHours: number; status: "active" | "suspended" | "graduated"; updatedAt: string };
type Classroom = { id: string; code: string; name: string; capacity: number; location: string; enabled: boolean; updatedAt: string };
type DanceStudio = { id: string; name: string; address: string; totalArea: number; roomCount: number; enabled: boolean; updatedAt: string };

const danceTypeOptions = [
  { label: "国际标准舞", value: "国际标准舞" },
  { label: "中国舞", value: "中国舞" },
  { label: "现代舞", value: "现代舞" },
  { label: "街舞", value: "街舞" },
  { label: "其他", value: "其他" },
];

export function MasterDataPage() {
  const [danceTypes, setDanceTypes] = useState<DanceType[]>([
    { id: "1", name: "芭蕾", category: "国际标准舞", price: 200, enabled: true, updatedAt: "2026-08-10" },
    { id: "2", name: "街舞", category: "街舞", price: 150, enabled: true, updatedAt: "2026-08-12" },
    { id: "3", name: "中国古典舞", category: "中国舞", price: 180, enabled: true, updatedAt: "2026-08-08" },
    { id: "4", name: "爵士舞", category: "现代舞", price: 160, enabled: false, updatedAt: "2026-07-20" },
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "1", name: "张悦", phone: "13800001111", danceTypes: ["芭蕾", "中国古典舞"], joinDate: "2023-03-15", enabled: true, updatedAt: "2026-08-10" },
    { id: "2", name: "李航", phone: "13900002222", danceTypes: ["街舞"], joinDate: "2024-06-01", enabled: true, updatedAt: "2026-08-12" },
    { id: "3", name: "王芳", phone: "13700003333", danceTypes: ["芭蕾"], joinDate: "2022-09-10", enabled: false, updatedAt: "2026-06-01" },
  ]);
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "陈小雨", phone: "13600004444", danceType: "芭蕾", totalHours: 48, status: "active", updatedAt: "2026-08-15" },
    { id: "2", name: "刘子涵", phone: "13500005555", danceType: "街舞", totalHours: 24, status: "active", updatedAt: "2026-08-14" },
    { id: "3", name: "赵思琪", phone: "13400006666", danceType: "中国古典舞", totalHours: 60, status: "graduated", updatedAt: "2026-07-01" },
  ]);
  const [danceStudios, setDanceStudios] = useState<DanceStudio[]>([
    { id: "1", name: "朝阳舞室", address: "朝阳区建国路88号", totalArea: 300, roomCount: 4, enabled: true, updatedAt: "2026-08-10" },
    { id: "2", name: "CBD教学中心", address: "CBD写字楼B座3层", totalArea: 500, roomCount: 6, enabled: true, updatedAt: "2026-08-12" },
    { id: "3", name: "西城艺术空间", address: "西城区金融街10号", totalArea: 200, roomCount: 2, enabled: false, updatedAt: "2026-07-20" },
  ]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { id: "1", code: "A101", name: "舞蹈教室1", capacity: 20, location: "1楼东侧", enabled: true, updatedAt: "2026-08-01" },
    { id: "2", code: "A102", name: "舞蹈教室2", capacity: 15, location: "1楼西侧", enabled: true, updatedAt: "2026-08-01" },
    { id: "3", code: "B201", name: "形体室", capacity: 25, location: "2楼", enabled: false, updatedAt: "2026-07-15" },
  ]);

  const [dtDrawerOpen, setDtDrawerOpen] = useState(false);
  const [dtForm] = Form.useForm();
  const [editingDt, setEditingDt] = useState<DanceType | null>(null);
  const [tDrawerOpen, setTDrawerOpen] = useState(false);
  const [tForm] = Form.useForm();
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [sDrawerOpen, setSDrawerOpen] = useState(false);
  const [sForm] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dsDrawerOpen, setDsDrawerOpen] = useState(false);
  const [dsForm] = Form.useForm();
  const [editingStudio, setEditingStudio] = useState<DanceStudio | null>(null);
  const [cDrawerOpen, setCDrawerOpen] = useState(false);
  const [cForm] = Form.useForm();
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const openDtCreate = () => { dtForm.resetFields(); setEditingDt(null); setDtDrawerOpen(true); };
  const openDtEdit = (record: DanceType) => { dtForm.setFieldsValue(record); setEditingDt(record); setDtDrawerOpen(true); };
  const confirmDtDelete = (record: DanceType) => {
    Modal.confirm({
      title: "确认删除",
      content: `删除舞种"${record.name}"后，已关联的课时记录将保留但不可新建。是否继续？`,
      okType: "danger",
      onOk() { setDanceTypes((prev) => prev.filter((i) => i.id !== record.id)); message.success("删除成功"); },
    });
  };

  const openTCreate = () => { tForm.resetFields(); setEditingTeacher(null); setTDrawerOpen(true); };
  const openTEdit = (record: Teacher) => { tForm.setFieldsValue(record); setEditingTeacher(record); setTDrawerOpen(true); };
  const toggleTeacher = (record: Teacher) => {
    setTeachers((prev) => prev.map((t) => t.id === record.id ? { ...t, enabled: !t.enabled } : t));
    message.success(record.enabled ? "已禁用教师" : "已启用教师");
  };

  const openSCreate = () => { sForm.resetFields(); setEditingStudent(null); setSDrawerOpen(true); };
  const openSEdit = (record: Student) => { sForm.setFieldsValue(record); setEditingStudent(record); setSDrawerOpen(true); };

  const openDsCreate = () => { dsForm.resetFields(); setEditingStudio(null); setDsDrawerOpen(true); };
  const openDsEdit = (record: DanceStudio) => { dsForm.setFieldsValue(record); setEditingStudio(record); setDsDrawerOpen(true); };
  const confirmDsDelete = (record: DanceStudio) => {
    Modal.confirm({
      title: "确认删除",
      content: `删除舞室"${record.name}"后，已关联的课时记录将保留。是否继续？`,
      okType: "danger",
      onOk() { setDanceStudios((prev) => prev.filter((i) => i.id !== record.id)); message.success("删除成功"); },
    });
  };

  const openCCreate = () => { cForm.resetFields(); setEditingClassroom(null); setCDrawerOpen(true); };
  const openCEdit = (record: Classroom) => { cForm.setFieldsValue(record); setEditingClassroom(record); setCDrawerOpen(true); };
  const confirmCDelete = (record: Classroom) => {
    Modal.confirm({
      title: "确认删除",
      content: `删除教室"${record.code}"后，已关联的课时记录将保留。是否继续？`,
      okType: "danger",
      onOk() { setClassrooms((prev) => prev.filter((i) => i.id !== record.id)); message.success("删除成功"); },
    });
  };

  const handleDtSave = async () => {
    const values = await dtForm.validateFields();
    if (editingDt) {
      setDanceTypes((prev) => prev.map((d) => d.id === editingDt.id ? { ...d, ...values, updatedAt: "2026-08-18" } : d));
      message.success("舞种信息已更新");
    } else {
      setDanceTypes((prev) => [...prev, { id: String(prev.length + 1), ...values, updatedAt: "2026-08-18" }]);
      message.success("舞种新增成功");
    }
    setDtDrawerOpen(false);
  };

  const handleTSave = async () => {
    const values = await tForm.validateFields();
    if (editingTeacher) {
      setTeachers((prev) => prev.map((t) => t.id === editingTeacher.id ? { ...t, ...values, updatedAt: "2026-08-18" } : t));
      message.success("教师信息已更新");
    } else {
      setTeachers((prev) => [...prev, { id: String(prev.length + 1), ...values, enabled: true, updatedAt: "2026-08-18" }]);
      message.success("教师新增成功");
    }
    setTDrawerOpen(false);
  };

  const handleSSave = async () => {
    const values = await sForm.validateFields();
    if (editingStudent) {
      setStudents((prev) => prev.map((s) => s.id === editingStudent.id ? { ...s, ...values, updatedAt: "2026-08-18" } : s));
      message.success("学员信息已更新");
    } else {
      setStudents((prev) => [...prev, { id: String(prev.length + 1), ...values, totalHours: 0, status: "active", updatedAt: "2026-08-18" }]);
      message.success("学员新增成功");
    }
    setSDrawerOpen(false);
  };

  const handleDsSave = async () => {
    const values = await dsForm.validateFields();
    if (editingStudio) {
      setDanceStudios((prev) => prev.map((d) => d.id === editingStudio.id ? { ...d, ...values, updatedAt: "2026-08-18" } : d));
      message.success("舞室信息已更新");
    } else {
      setDanceStudios((prev) => [...prev, { id: String(prev.length + 1), ...values, enabled: true, updatedAt: "2026-08-18" }]);
      message.success("舞室新增成功");
    }
    setDsDrawerOpen(false);
  };

  const handleCSave = async () => {
    const values = await cForm.validateFields();
    if (editingClassroom) {
      setClassrooms((prev) => prev.map((c) => c.id === editingClassroom.id ? { ...c, ...values, updatedAt: "2026-08-18" } : c));
      message.success("教室信息已更新");
    } else {
      setClassrooms((prev) => [...prev, { id: String(prev.length + 1), ...values, enabled: true, updatedAt: "2026-08-18" }]);
      message.success("教室新增成功");
    }
    setCDrawerOpen(false);
  };

  const dtStatusTag = (enabled: boolean) => <Tag color={enabled ? "green" : "default"}>{enabled ? "启用" : "禁用"}</Tag>;
  const studentStatusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = { active: { color: "green", label: "在读" }, suspended: { color: "gold", label: "休学" }, graduated: { color: "default", label: "毕业" } };
    const m = map[status] ?? map.active;
    return <Tag color={m.color}>{m.label}</Tag>;
  };

  const dtColumns: ColumnsType<DanceType> = [
    { title: "舞种名称", dataIndex: "name", key: "name", width: 120 },
    { title: "分类", dataIndex: "category", key: "category", width: 120 },
    { title: "课时单价（元）", dataIndex: "price", key: "price", width: 130, align: "right" },
    { title: "状态", dataIndex: "enabled", key: "enabled", width: 80, render: (v: boolean) => dtStatusTag(v) },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    {
      title: "操作", key: "action", width: 120,
      render: (_, record) => (
        <TableActions actions={[
          { key: "edit", label: "编辑", onClick: () => openDtEdit(record) },
          { key: "delete", label: "删除", danger: true, onClick: () => confirmDtDelete(record) },
        ]} />
      ),
    },
  ];

  const tColumns: ColumnsType<Teacher> = [
    { title: "教师姓名", dataIndex: "name", key: "name", width: 120 },
    { title: "手机号", dataIndex: "phone", key: "phone", width: 150 },
    { title: "擅长舞种", dataIndex: "danceTypes", key: "danceTypes", render: (v: string[]) => v.map((t) => <Tag key={t} color="blue">{t}</Tag>) },
    { title: "入职日期", dataIndex: "joinDate", key: "joinDate", width: 130 },
    { title: "状态", dataIndex: "enabled", key: "enabled", width: 80, render: (v: boolean) => dtStatusTag(v) },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    {
      title: "操作", key: "action", width: 160,
      render: (_, record) => (
        <TableActions actions={[
          { key: "edit", label: "编辑", onClick: () => openTEdit(record) },
          { key: "toggle", label: record.enabled ? "禁用" : "启用", onClick: () => toggleTeacher(record) },
        ]} />
      ),
    },
  ];

  const sColumns: ColumnsType<Student> = [
    { title: "学员姓名", dataIndex: "name", key: "name", width: 120 },
    { title: "手机号", dataIndex: "phone", key: "phone", width: 150 },
    { title: "绑定舞种", dataIndex: "danceType", key: "danceType", width: 120 },
    { title: "累计课时", dataIndex: "totalHours", key: "totalHours", width: 100, align: "right" },
    { title: "状态", dataIndex: "status", key: "status", width: 80, render: (v: string) => studentStatusTag(v) },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    {
      title: "操作", key: "action", width: 100,
      render: (_, record) => <Button type="link" size="small" onClick={() => openSEdit(record)}>编辑</Button>,
    },
  ];

  const dsColumns: ColumnsType<DanceStudio> = [
    { title: "舞室名称", dataIndex: "name", key: "name", width: 160 },
    { title: "地址", dataIndex: "address", key: "address", width: 220 },
    { title: "总面积（㎡）", dataIndex: "totalArea", key: "totalArea", width: 140, align: "right" },
    { title: "教室数", dataIndex: "roomCount", key: "roomCount", width: 90, align: "right" },
    { title: "状态", dataIndex: "enabled", key: "enabled", width: 80, render: (v: boolean) => dtStatusTag(v) },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    {
      title: "操作", key: "action", width: 120,
      render: (_, record) => (
        <TableActions actions={[
          { key: "edit", label: "编辑", onClick: () => openDsEdit(record) },
          { key: "delete", label: "删除", danger: true, onClick: () => confirmDsDelete(record) },
        ]} />
      ),
    },
  ];

  const cColumns: ColumnsType<Classroom> = [
    { title: "教室编号", dataIndex: "code", key: "code", width: 110 },
    { title: "教室名称", dataIndex: "name", key: "name", width: 130 },
    { title: "容量", dataIndex: "capacity", key: "capacity", width: 80, align: "right" },
    { title: "位置", dataIndex: "location", key: "location", width: 130 },
    { title: "状态", dataIndex: "enabled", key: "enabled", width: 80, render: (v: boolean) => dtStatusTag(v) },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    {
      title: "操作", key: "action", width: 120,
      render: (_, record) => (
        <TableActions actions={[
          { key: "edit", label: "编辑", onClick: () => openCEdit(record) },
          { key: "delete", label: "删除", danger: true, onClick: () => confirmCDelete(record) },
        ]} />
      ),
    },
  ];

  return (
    <main className="page">
      <PageHeader
        title="主数据配置"
        description="统一管理舞种、教师、学员、教室、舞室等基础数据，为课时登记与分析提供数据源。"
      />

      <SectionPanel
        title="舞种管理"
        actions={
          <Button icon={<Plus size={14} />} onClick={openDtCreate} type="primary">
            新增舞种
          </Button>
        }
      >
        <Table<DanceType> columns={dtColumns} dataSource={danceTypes} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
      </SectionPanel>

      <SectionPanel
        title="教师管理"
        actions={
          <Button icon={<Plus size={14} />} onClick={openTCreate} type="primary">
            新增教师
          </Button>
        }
      >
        <Table<Teacher> columns={tColumns} dataSource={teachers} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
      </SectionPanel>

      <SectionPanel
        title="学员管理"
        actions={
          <Button icon={<Plus size={14} />} onClick={openSCreate} type="primary">
            新增学员
          </Button>
        }
      >
        <Table<Student> columns={sColumns} dataSource={students} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
      </SectionPanel>

      <SectionPanel
        title="舞室管理"
        actions={
          <Button icon={<Plus size={14} />} onClick={openDsCreate} type="primary">
            新增舞室
          </Button>
        }
      >
        <Table<DanceStudio> columns={dsColumns} dataSource={danceStudios} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
      </SectionPanel>

      <SectionPanel
        title="教室管理"
        actions={
          <Button icon={<Plus size={14} />} onClick={openCCreate} type="primary">
            新增教室
          </Button>
        }
      >
        <Table<Classroom> columns={cColumns} dataSource={classrooms} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
      </SectionPanel>

      <Drawer
        title={editingDt ? "编辑舞种" : "新增舞种"}
        open={dtDrawerOpen}
        onClose={() => setDtDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setDtDrawerOpen(false)}>取消</Button>
            <Button onClick={handleDtSave} type="primary">保存</Button>
          </Space>
        }
      >
        <Form form={dtForm} layout="vertical" initialValues={{ enabled: true }}>
          <Form.Item label="舞种名称" name="name" rules={[{ required: true, message: "请输入舞种名称" }]}>
            <Input placeholder="如：芭蕾、街舞" />
          </Form.Item>
          <Form.Item label="舞种分类" name="category" rules={[{ required: true, message: "请选择分类" }]}>
            <Select options={danceTypeOptions} placeholder="请选择分类" />
          </Form.Item>
          <Form.Item label="课时单价（元）" name="price">
            <InputNumber min={0} max={9999} precision={0} placeholder="可选" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="状态" name="enabled" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingTeacher ? "编辑教师" : "新增教师"}
        open={tDrawerOpen}
        onClose={() => setTDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setTDrawerOpen(false)}>取消</Button>
            <Button onClick={handleTSave} type="primary">保存</Button>
          </Space>
        }
      >
        <Form form={tForm} layout="vertical">
          <Form.Item label="教师姓名" name="name" rules={[{ required: true, message: "请输入教师姓名" }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: "请输入手机号" }, { pattern: /^1\d{10}$/, message: "请输入正确的手机号" }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="擅长舞种" name="danceTypes" rules={[{ required: true, message: "请至少选择一个舞种" }]}>
            <Select mode="multiple" placeholder="请选择擅长舞种" options={danceTypeOptions.map((o) => ({ label: o.value, value: o.value }))} />
          </Form.Item>
          <Form.Item label="入职日期" name="joinDate">
            <DatePicker style={{ width: "100%" }} placeholder="可选" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingStudent ? "编辑学员" : "新增学员"}
        open={sDrawerOpen}
        onClose={() => setSDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setSDrawerOpen(false)}>取消</Button>
            <Button onClick={handleSSave} type="primary">保存</Button>
          </Space>
        }
      >
        <Form form={sForm} layout="vertical">
          <Form.Item label="学员姓名" name="name" rules={[{ required: true, message: "请输入学员姓名" }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: "请输入手机号" }, { pattern: /^1\d{10}$/, message: "请输入正确的手机号" }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="绑定舞种" name="danceType" rules={[{ required: true, message: "请选择舞种" }]}>
            <Select placeholder="请选择舞种" options={danceTypeOptions.map((o) => ({ label: o.value, value: o.value }))} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[
              { label: "在读", value: "active" },
              { label: "休学", value: "suspended" },
              { label: "毕业", value: "graduated" },
            ]} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingStudio ? "编辑舞室" : "新增舞室"}
        open={dsDrawerOpen}
        onClose={() => setDsDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setDsDrawerOpen(false)}>取消</Button>
            <Button onClick={handleDsSave} type="primary">保存</Button>
          </Space>
        }
      >
        <Form form={dsForm} layout="vertical">
          <Form.Item label="舞室名称" name="name" rules={[{ required: true, message: "请输入舞室名称" }]}>
            <Input placeholder="如：朝阳舞室、CBD教学中心" />
          </Form.Item>
          <Form.Item label="地址" name="address" rules={[{ required: true, message: "请输入地址" }]}>
            <Input placeholder="如：朝阳区建国路88号" />
          </Form.Item>
          <Form.Item label="总面积（㎡）" name="totalArea" rules={[{ required: true, message: "请输入总面积" }, { type: "number", min: 1, message: "面积需大于0" }]}>
            <InputNumber min={1} max={10000} precision={0} style={{ width: "100%" }} placeholder="单位：平方米" />
          </Form.Item>
          <Form.Item label="教室数" name="roomCount" rules={[{ required: true, message: "请输入教室数" }, { type: "number", min: 1, message: "教室数需至少为1" }]}>
            <InputNumber min={1} max={50} style={{ width: "100%" }} placeholder="该舞室内独立教室数量" />
          </Form.Item>
          <Form.Item label="状态" name="enabled" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingClassroom ? "编辑教室" : "新增教室"}
        open={cDrawerOpen}
        onClose={() => setCDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setCDrawerOpen(false)}>取消</Button>
            <Button onClick={handleCSave} type="primary">保存</Button>
          </Space>
        }
      >
        <Form form={cForm} layout="vertical">
          <Form.Item label="教室编号" name="code" rules={[{ required: true, message: "请输入教室编号" }]}>
            <Input placeholder="如：A101" />
          </Form.Item>
          <Form.Item label="教室名称" name="name">
            <Input placeholder="如：舞蹈教室1" />
          </Form.Item>
          <Form.Item label="容量（人）" name="capacity" rules={[{ required: true, message: "请输入容量" }]}>
            <InputNumber min={1} max={200} style={{ width: "100%" }} placeholder="最大容纳人数" />
          </Form.Item>
          <Form.Item label="位置" name="location">
            <Input placeholder="如：1楼东侧" />
          </Form.Item>
        </Form>
      </Drawer>
    </main>
  );
}
