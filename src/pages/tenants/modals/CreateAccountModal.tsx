import React from "react";
import { Modal, Form, Input, Select, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export interface CreateAccountModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  confirmLoading: boolean;
  form: any;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
  form,
}) => {
  return (
    <Modal
      title={
        <Space>
          <PlusOutlined style={{ color: "#3b82f6" }} />
          <span>Create Tenant User Account</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username is required" }]}
        >
          <Input placeholder="e.g. john.doe" />
        </Form.Item>

        <Form.Item
          name="display_name"
          label="Display Name"
          rules={[{ required: true, message: "Display name is required" }]}
        >
          <Input placeholder="e.g. John Doe" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              required: true,
              type: "email",
              message: "Valid email is required",
            },
          ]}
        >
          <Input placeholder="e.g. john@tenant.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Account Password"
          extra="Leave blank to auto-generate a secure temporary password"
        >
          <Input.Password placeholder="Enter password or leave blank to auto-generate" />
        </Form.Item>

        <Form.Item name="role" label="Account Role" initialValue="User">
          <Select>
            <Select.Option value="TenantAdmin">
              Tenant Administrator
            </Select.Option>
            <Select.Option value="User">Standard User</Select.Option>
            <Select.Option value="ServiceAccount">
              Service Account / Machine
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="quota_gb"
          label="Storage Quota (GB)"
          initialValue={25}
        >
          <Select>
            <Select.Option value={10}>10 GB</Select.Option>
            <Select.Option value={25}>25 GB</Select.Option>
            <Select.Option value={50}>50 GB</Select.Option>
            <Select.Option value={100}>100 GB</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
