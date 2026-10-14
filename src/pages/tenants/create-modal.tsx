import { Modal, Form, Input, InputNumber, Alert, Space, Button } from "antd";
import { RocketOutlined, InfoCircleOutlined } from "@ant-design/icons";

interface CreateTenantModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (err) {
      // Form validation error
    }
  };

  return (
    <Modal
      title={
        <span>
          <RocketOutlined style={{ color: "#ec7211", marginRight: 8 }} />
          Provision Dedicated Tenant
        </span>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Launch Tenant Instance"
      okButtonProps={{
        style: { backgroundColor: "#ec7211", borderColor: "#ec7211" },
      }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ quota_gb: 100 }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="tenant_id"
          label="Tenant Identifier (Slug)"
          rules={[
            { required: true, message: "Please input tenant slug" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Lowercase letters, numbers, and hyphens only",
            },
          ]}
          extra="Unique identifier used for ECS task service and DynamoDB partition key."
        >
          <Input placeholder="e.g. acme-corp" />
        </Form.Item>

        <Form.Item
          name="domain"
          label="Custom Ingress Domain"
          extra="Leave blank to default to [tenant-id].png261.dev"
        >
          <Input placeholder="acme.png261.dev" />
        </Form.Item>

        <Form.Item
          name="admin_email"
          label="Tenant Admin Email"
          rules={[
            { required: true, message: "Please enter tenant admin email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="admin@acme.com" />
        </Form.Item>

        <Form.Item
          name="quota_gb"
          label="Storage Quota (GB)"
          rules={[{ required: true, message: "Please enter quota" }]}
        >
          <Space.Compact style={{ width: "100%" }}>
            <InputNumber
              min={10}
              max={5000}
              style={{ width: "100%" }}
            />
            <Button disabled style={{ color: "rgba(0, 0, 0, 0.45)", backgroundColor: "#fafafa" }}>GB</Button>
          </Space.Compact>
        </Form.Item>

        <Alert
          message="AWS Multi-Tenant Isolation"
          description="Provisions dedicated ECS Fargate task, dedicated database schema in RDS PostgreSQL, dedicated EFS configuration access point, and registers instance in DynamoDB."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      </Form>
    </Modal>
  );
};
