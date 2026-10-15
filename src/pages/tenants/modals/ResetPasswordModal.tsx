import React from "react";
import { Modal, Alert, Descriptions, Typography, Button } from "antd";

const { Paragraph } = Typography;

export interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  tempPasswordInfo: { username: string; password: string } | null;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  tempPasswordInfo,
}) => {
  return (
    <Modal
      title="Temporary Credentials Generated"
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
        message="Password reset successfully!"
        description="A temporary one-time password has been generated and stored in AWS Secrets Manager."
        style={{ marginBottom: 16 }}
      />
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Target Account">
          <strong>{tempPasswordInfo?.username}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Temporary Password">
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
        <Descriptions.Item label="Validity">
          24 Hours (User prompted to change on initial login)
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
