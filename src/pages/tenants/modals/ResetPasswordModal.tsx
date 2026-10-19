import React from "react";
import { Modal, Alert, Descriptions, Typography, Button } from "antd";

const { Paragraph } = Typography;

export interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  tempPasswordInfo: { username: string; password: string } | null;
  domain?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  tempPasswordInfo,
  domain,
}) => {
  return (
    <Modal
      title="Tenant Account Credentials"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      destroyOnHidden
      footer={[
        <Button key="ok" type="primary" onClick={onClose}>
          Done
        </Button>,
      ]}
    >
      <Alert
        type="success"
        showIcon
        message="Credentials Ready & Configured"
        description="Password has been generated and securely stored in AWS Secrets Manager for this tenant."
        style={{ marginBottom: 16 }}
      />
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Target Account">
          <strong>{tempPasswordInfo?.username}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Account Password">
          <Paragraph
            copyable
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#1652f0",
              fontSize: 16,
            }}
          >
            {tempPasswordInfo?.password}
          </Paragraph>
        </Descriptions.Item>
        {domain && (
          <Descriptions.Item label="Nextcloud Portal">
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600, color: "#1652f0" }}
            >
              https://{domain}
            </a>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Status">
          Ready for immediate sign-in
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
