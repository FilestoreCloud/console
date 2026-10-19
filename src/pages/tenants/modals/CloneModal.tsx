import React from "react";
import { Modal, Form, Input, Button, Space, Tag, Alert } from "antd";
import { BranchesOutlined } from "@ant-design/icons";

export interface CloneModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading: boolean;
  form: any;
  tenantId: string;
  domain: string;
}

export const CloneModal: React.FC<CloneModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
  form,
  tenantId,
  domain,
}) => {
  return (
    <Modal
      title={
        <Space>
          <BranchesOutlined style={{ color: "#8b5cf6" }} />
          <span>Fork Tenant to Isolated Staging Sandbox</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message="Multi-Tenant Isolation Guarantees"
        description={`Cloning '${tenantId}' provisions an isolated staging sandbox with dedicated PostgreSQL database 'nc_<target>', dedicated S3 prefix, dedicated EFS mount path, and container service.`}
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Source Tenant Template">
          <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>
            {tenantId} ({domain})
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
          <Space wrap>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<BranchesOutlined />}
              style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
            >
              Provision Staging Sandbox
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
