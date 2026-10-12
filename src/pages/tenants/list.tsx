import React, { useState } from "react";
import {
  useList,
  useCreate,
  useUpdate,
  useDelete,
  useCan,
  useNavigation,
} from "@refinedev/core";
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Popconfirm,
  Typography,
  Tooltip,
  message,
  Modal,
  Form,
  Alert,
} from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  HddOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  PauseOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  LinkOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  EyeOutlined,
  WarningOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { CreateTenantModal } from "./create-modal";
import { dataProvider } from "../../providers/dataProvider";

const { Text } = Typography;

export const TenantList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);

  // Fork / Sandbox state
  const [forkModalVisible, setForkModalVisible] = useState(false);
  const [forkSourceTenant, setForkSourceTenant] = useState<any>(null);
  const [forkLoading, setForkLoading] = useState(false);
  const [forkForm] = Form.useForm();

  const { show } = useNavigation();

  // Refine hooks
  const { data, isLoading, refetch } = useList({
    resource: "tenants",
  });
  const { mutate: createTenant, isLoading: isCreating } = useCreate();
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteTenant, isLoading: isDeleting } = useDelete();

  // RBAC checks via Refine's accessControlProvider
  const { data: canCreate } = useCan({ resource: "tenants", action: "create" });
  const { data: canDelete } = useCan({ resource: "tenants", action: "delete" });

  const tenants = (data?.data || []) as any[];

  // KPI Calculations
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenants.filter(
    (t) => t.status === "SUSPENDED",
  ).length;
  const totalQuota = tenants.reduce(
    (acc, t) => acc + (parseInt(t.quota_gb) || 0),
    0,
  );

  // Filter logic
  const filteredTenants = tenants.filter((t) => {
    const s = searchText.toLowerCase();
    const matchesSearch =
      !s ||
      t.tenant_id?.toLowerCase().includes(s) ||
      t.domain?.toLowerCase().includes(s) ||
      t.admin_email?.toLowerCase().includes(s);

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (tenantId: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "SUSPEND" : "RESUME";
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: { action },
      },
      {
        onSuccess: () => {
          message.success(
            `Tenant ${tenantId} ${action === "SUSPEND" ? "suspended" : "resumed"} successfully!`,
          );
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Action failed");
        },
      },
    );
  };

  const handleDelete = (tenantId: string) => {
    deleteTenant(
      {
        resource: "tenants",
        id: tenantId,
      },
      {
        onSuccess: () => {
          message.success(`Tenant ${tenantId} deleted successfully!`);
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Deletion failed");
        },
      },
    );
  };

  const handleCreateSubmit = async (values: any) => {
    createTenant(
      {
        resource: "tenants",
        values: {
          tenant_id: values.tenant_id.toLowerCase().trim(),
          domain: values.domain?.trim() || `${values.tenant_id}.png261.dev`,
          admin_email: values.admin_email.trim(),
          quota_gb: values.quota_gb,
        },
      },
      {
        onSuccess: () => {
          message.success(
            `Tenant ${values.tenant_id} successfully provisioned!`,
          );
          setModalVisible(false);
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Provisioning failed");
        },
      },
    );
  };

  const handleOpenForkModal = (record: any) => {
    setForkSourceTenant(record);
    forkForm.setFieldsValue({
      target_tenant_id: `${record.tenant_id}-staging`,
      target_domain: `${record.tenant_id}-staging.png261.dev`,
      admin_email: record.admin_email || `admin@${record.tenant_id}.com`,
      quota_gb: record.quota_gb || 50,
    });
    setForkModalVisible(true);
  };

  const handleForkSubmit = async (values: any) => {
    setForkLoading(true);
    try {
      const targetId = values.target_tenant_id.toLowerCase().trim();
      await dataProvider.custom({
        url: "/api",
        method: "POST",
        payload: {
          action: "CLONE_TENANT",
          source_tenant_id: forkSourceTenant?.tenant_id,
          target_tenant_id: targetId,
          target_domain: values.target_domain?.trim(),
          admin_email: values.admin_email?.trim(),
          quota_gb: values.quota_gb,
        },
      });
      message.success(
        `Tenant '${forkSourceTenant?.tenant_id}' cloned to sandbox '${targetId}'!`,
      );
      setForkModalVisible(false);
      forkForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.message || "Failed to clone tenant");
    } finally {
      setForkLoading(false);
    }
  };

  const columns = [
    {
      title: "Tenant Identifier",
      dataIndex: "tenant_id",
      key: "tenant_id",
      render: (tid: string, record: any) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="link"
              style={{ padding: 0, fontWeight: 700, fontSize: 14 }}
              onClick={() => show("tenants", tid)}
            >
              {tid}
            </Button>
            {record.is_sandbox && (
              <Tooltip
                title={
                  record.cloned_from
                    ? `Forked from '${record.cloned_from}'`
                    : "Isolated Staging Sandbox"
                }
              >
                <Tag
                  color="purple"
                  icon={<BranchesOutlined />}
                  style={{ marginLeft: 6, fontSize: 10 }}
                >
                  SANDBOX
                </Tag>
              </Tooltip>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Partition: HASH (AWS Fargate)
          </Text>
        </div>
      ),
    },
    {
      title: "Dedicated Ingress",
      dataIndex: "domain",
      key: "domain",
      render: (domain: string, record: any) => {
        const fullDomain = domain || `${record.tenant_id}.png261.dev`;
        return (
          <div>
            <a
              href={`https://${fullDomain}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600, color: "#0284c7" }}
            >
              {fullDomain} <LinkOutlined style={{ fontSize: 11 }} />
            </a>
            <div style={{ marginTop: 2 }}>
              <Tag
                color="gold"
                icon={<SafetyCertificateOutlined />}
                style={{ fontSize: 10 }}
              >
                AWS Secrets Manager
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Admin Contact",
      dataIndex: "admin_email",
      key: "admin_email",
      render: (email: string) => (
        <Text style={{ fontSize: 13 }}>{email || "admin@acme.com"}</Text>
      ),
    },
    {
      title: "Quota",
      dataIndex: "quota_gb",
      key: "quota_gb",
      render: (quota: any) => <Tag color="blue">{quota || 100} GB</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: string) => {
        switch (st) {
          case "ACTIVE":
            return (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                ACTIVE
              </Tag>
            );
          case "DEGRADED":
            return (
              <Tag color="warning" icon={<AlertOutlined />}>
                DEGRADED
              </Tag>
            );
          case "INCIDENT":
            return (
              <Tag color="error" icon={<WarningOutlined />}>
                INCIDENT
              </Tag>
            );
          case "MAINTENANCE":
            return (
              <Tag color="processing" icon={<ClockCircleOutlined />}>
                MAINTENANCE
              </Tag>
            );
          case "SUSPENDED":
          default:
            return (
              <Tag color="default" icon={<PauseCircleOutlined />}>
                SUSPENDED
              </Tag>
            );
        }
      },
    },
    {
      title: "Isolated Infrastructure",
      key: "infra",
      render: (_: any, record: any) => {
        const svc = record.service_name || `service-${record.tenant_id}`;
        const db =
          record.database_name || `nc_${record.tenant_id.replace(/-/g, "_")}`;
        const ap =
          record.efs_access_point_id || `/tenants/${record.tenant_id}/config`;
        return (
          <Space direction="vertical" size={2}>
            <Tag
              color={record.status === "ACTIVE" ? "green" : "default"}
              icon={<ClusterOutlined />}
            >
              {svc} ({record.status === "ACTIVE" ? "1 task" : "0 tasks / $0"})
            </Tag>
            <Tag color="cyan" icon={<DatabaseOutlined />}>
              {db}
            </Tag>
            <Tag
              color="default"
              style={{ fontSize: 10, fontFamily: "monospace" }}
            >
              {ap}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => {
        const isAuditor = canCreate?.can === false && canDelete?.can === false;
        if (isAuditor) {
          return (
            <Space>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<EyeOutlined />}
                onClick={() => show("tenants", record.tenant_id)}
              >
                Inspect
              </Button>
              <Tag color="default" icon={<LockOutlined />}>
                Read Only
              </Tag>
            </Space>
          );
        }

        const isActive = record.status === "ACTIVE";
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => show("tenants", record.tenant_id)}
            >
              Manage
            </Button>

            <Button
              size="small"
              icon={<BranchesOutlined />}
              style={{ color: "#8b5cf6", borderColor: "#8b5cf6" }}
              onClick={() => handleOpenForkModal(record)}
            >
              Fork
            </Button>

            <Button
              size="small"
              icon={isActive ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() =>
                handleToggleStatus(record.tenant_id, record.status)
              }
              loading={isUpdating}
            >
              {isActive ? "Suspend" : "Resume"}
            </Button>

            {canDelete?.can ? (
              <Popconfirm
                title="Permanently Delete Tenant?"
                description={`Delete tenant "${record.tenant_id}" and tear down dedicated ECS service & target group?`}
                onConfirm={() => handleDelete(record.tenant_id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                />
              </Popconfirm>
            ) : (
              <Tooltip
                title={canDelete?.reason || "Restricted to SuperAdmin role"}
              >
                <Button size="small" disabled icon={<LockOutlined />} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* 1. KPI Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Statistic
              title="TOTAL REGISTERED TENANTS"
              value={totalTenants}
              prefix={<AppstoreOutlined style={{ color: "#3b82f6" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Statistic
              title="ACTIVE DEPLOYMENTS"
              value={activeTenants}
              valueStyle={{ color: "#16a34a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Statistic
              title="SUSPENDED DEPLOYMENTS"
              value={suspendedTenants}
              valueStyle={{ color: "#ea580c" }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Statistic
              title="ALLOCATED STORAGE"
              value={totalQuota}
              suffix="GB"
              valueStyle={{ color: "#0284c7" }}
              prefix={<HddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Action & Filter Bar */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space style={{ width: "100%" }}>
              <Input
                placeholder="Search Tenant ID, domain, email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 260 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "ACTIVE", label: "Active Only" },
                  { value: "SUSPENDED", label: "Suspended Only" },
                ]}
              />
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                Refresh
              </Button>
              {canCreate?.can ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                  style={{ backgroundColor: "#ec7211", borderColor: "#ec7211" }}
                >
                  Provision Dedicated Tenant
                </Button>
              ) : (
                <Tag
                  color="warning"
                  icon={<LockOutlined />}
                  style={{ padding: "4px 8px" }}
                >
                  Auditor Mode: Read-Only
                </Tag>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 3. Tenants Table */}
      <Card
        bordered={false}
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          columns={columns}
          dataSource={filteredTenants}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {/* 4. Provision Modal */}
      <CreateTenantModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreateSubmit}
        loading={isCreating}
      />

      {/* 5. Fork / Clone to Sandbox Modal */}
      <Modal
        title={
          <Space>
            <BranchesOutlined style={{ color: "#8b5cf6" }} />
            <span>Fork Tenant to Staging Sandbox</span>
          </Space>
        }
        open={forkModalVisible}
        onCancel={() => setForkModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          message="Container & Data Isolation Guarantees"
          description={`Cloning '${forkSourceTenant?.tenant_id}' provisions an isolated staging environment with dedicated database 'nc_<target>', dedicated S3 prefix, dedicated EFS mount path, and container service.`}
          style={{ marginBottom: 16 }}
        />
        <Form form={forkForm} layout="vertical" onFinish={handleForkSubmit}>
          <Form.Item label="Source Tenant Template">
            <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>
              {forkSourceTenant?.tenant_id} ({forkSourceTenant?.domain})
            </Tag>
          </Form.Item>

          <Form.Item
            name="target_tenant_id"
            label="Sandbox Tenant Identifier (Slug)"
            rules={[
              { required: true, message: "Sandbox tenant ID is required" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Lowercase letters, numbers, and hyphens only",
              },
            ]}
          >
            <Input placeholder="e.g. acme-staging, marvel-sandbox" />
          </Form.Item>

          <Form.Item
            name="target_domain"
            label="Dedicated Host-Header Ingress Domain"
          >
            <Input placeholder="e.g. acme-staging.png261.dev" />
          </Form.Item>

          <Form.Item name="admin_email" label="Sandbox Admin Contact Email">
            <Input type="email" placeholder="e.g. admin@acme-staging.com" />
          </Form.Item>

          <Form.Item name="quota_gb" label="Storage Quota (GB)">
            <Input type="number" placeholder="50" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setForkModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={forkLoading}
                icon={<BranchesOutlined />}
                style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
              >
                Provision Staging Sandbox
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
