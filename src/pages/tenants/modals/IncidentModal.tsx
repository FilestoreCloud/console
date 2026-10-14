import React from "react";
import { Modal, Form, Select, Row, Col, Input, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";

export interface IncidentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  confirmLoading: boolean;
  form: any;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
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
          <WarningOutlined style={{ color: "#ef4444" }} />
          <span>Incident Management & Status Circuit Breaker</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      destroyOnHidden
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="status"
          label="Tenant Circuit State"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="ACTIVE">
              ACTIVE (Normal Operation)
            </Select.Option>
            <Select.Option value="DEGRADED">
              DEGRADED (Elevated Latency / Issues)
            </Select.Option>
            <Select.Option value="INCIDENT">
              INCIDENT (Severe Outage / Accident)
            </Select.Option>
            <Select.Option value="MAINTENANCE">
              MAINTENANCE (Emergency Maintenance Mode)
            </Select.Option>
            <Select.Option value="SUSPENDED">
              SUSPENDED (Compute Scaled to 0)
            </Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="severity"
              label="Severity Level"
              initialValue="SEV-2"
            >
              <Select>
                <Select.Option value="SEV-1">SEV-1 Critical Outage</Select.Option>
                <Select.Option value="SEV-2">SEV-2 Major Degradation</Select.Option>
                <Select.Option value="SEV-3">SEV-3 Minor Impairment</Select.Option>
                <Select.Option value="Notice">Operational Notice</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="incident_state"
              label="Resolution State"
              initialValue="INVESTIGATING"
            >
              <Select>
                <Select.Option value="INVESTIGATING">INVESTIGATING</Select.Option>
                <Select.Option value="IDENTIFIED">IDENTIFIED</Select.Option>
                <Select.Option value="MITIGATING">MITIGATING</Select.Option>
                <Select.Option value="RESOLVED">RESOLVED</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Incident Title / Summary"
          rules={[{ required: true, message: "Please provide incident title" }]}
        >
          <Input placeholder="e.g. High memory utilization in Nextcloud worker container" />
        </Form.Item>

        <Form.Item name="description" label="Incident Details">
          <Input.TextArea
            rows={2}
            placeholder="Explain observed symptoms, error codes, and customer impact"
          />
        </Form.Item>

        <Form.Item name="root_cause" label="Root Cause Analysis">
          <Input.TextArea
            rows={2}
            placeholder="e.g. DB connection leak, EFS IOPS burst capacity exhausted, large sync storm"
          />
        </Form.Item>

        <Form.Item
          name="action_taken"
          label="Remediation / Corrective Action"
        >
          <Input.TextArea
            rows={2}
            placeholder="e.g. Triggered container task rolling restart, scaled resources, isolated tenant traffic"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
