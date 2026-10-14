import React from "react";
import { Tag, Progress, Space, Typography, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  AlertOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

export const renderStatusTag = (status: string, record?: any): React.ReactNode => {
  switch (status) {
    case "ACTIVE":
      return <Tag color="success" icon={<CheckCircleOutlined />}>ACTIVE</Tag>;
    case "PROVISIONING": {
      const progress = Number(record?.progress || 20);
      const step = record?.current_step || "Provisioning AWS resources...";
      return (
        <Tooltip title={`Step: ${step}`}>
          <Space direction="vertical" size={2} style={{ width: "100%", minWidth: 150 }}>
            <Tag color="processing" icon={<SyncOutlined spin />}>
              PROVISIONING ({progress}%)
            </Tag>
            <Progress
              percent={progress}
              size="small"
              status="active"
              showInfo={false}
              strokeColor={{ "0%": "#108ee9", "100%": "#52c41a" }}
              style={{ margin: 0 }}
            />
            <Typography.Text type="secondary" ellipsis style={{ fontSize: 11, maxWidth: 180 }}>
              {step}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    case "DELETING":
    case "DEPROVISIONING": {
      const progress = Number(record?.progress || 15);
      const step = record?.current_step || "Tearing down dedicated AWS resources...";
      return (
        <Tooltip title={`Step: ${step}`}>
          <Space direction="vertical" size={2} style={{ width: "100%", minWidth: 150 }}>
            <Tag color="error" icon={<SyncOutlined spin />}>
              DELETING ({progress}%)
            </Tag>
            <Progress
              percent={progress}
              size="small"
              status="exception"
              showInfo={false}
              strokeColor={{ "0%": "#faad14", "100%": "#ff4d4f" }}
              style={{ margin: 0 }}
            />
            <Typography.Text type="danger" ellipsis style={{ fontSize: 11, maxWidth: 180 }}>
              {step}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    case "SUSPENDING": {
      const progress = Number(record?.progress || 30);
      const step = record?.current_step || "Scaling tasks to 0 & draining traffic...";
      return (
        <Tooltip title={`Step: ${step}`}>
          <Space direction="vertical" size={2} style={{ width: "100%", minWidth: 150 }}>
            <Tag color="warning" icon={<SyncOutlined spin />}>
              SUSPENDING ({progress}%)
            </Tag>
            <Progress
              percent={progress}
              size="small"
              status="active"
              showInfo={false}
              strokeColor="#fa8c16"
              style={{ margin: 0 }}
            />
            <Typography.Text style={{ fontSize: 11, maxWidth: 180, color: "#d46b08" }} ellipsis>
              {step}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    case "RESUMING": {
      const progress = Number(record?.progress || 25);
      const step = record?.current_step || "Scaling tasks to 1 & verifying container health...";
      return (
        <Tooltip title={`Step: ${step}`}>
          <Space direction="vertical" size={2} style={{ width: "100%", minWidth: 150 }}>
            <Tag color="cyan" icon={<SyncOutlined spin />}>
              RESUMING ({progress}%)
            </Tag>
            <Progress
              percent={progress}
              size="small"
              status="active"
              showInfo={false}
              strokeColor="#13c2c8"
              style={{ margin: 0 }}
            />
            <Typography.Text style={{ fontSize: 11, maxWidth: 180, color: "#08979c" }} ellipsis>
              {step}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    case "SEEDING": {
      const progress = Number(record?.progress || 20);
      const step = record?.current_step || "Seeding demo accounts and files...";
      return (
        <Tooltip title={`Step: ${step}`}>
          <Space direction="vertical" size={2} style={{ width: "100%", minWidth: 150 }}>
            <Tag color="purple" icon={<SyncOutlined spin />}>
              SEEDING ({progress}%)
            </Tag>
            <Progress
              percent={progress}
              size="small"
              status="active"
              showInfo={false}
              strokeColor="#722ed1"
              style={{ margin: 0 }}
            />
            <Typography.Text style={{ fontSize: 11, maxWidth: 180, color: "#531dab" }} ellipsis>
              {step}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    case "FAILED":
      return (
        <Tooltip title={record?.last_error || "Provisioning failed and Saga rollback completed"}>
          <Space direction="vertical" size={2}>
            <Tag color="error" icon={<CloseCircleOutlined />}>
              FAILED
            </Tag>
            <Typography.Text type="danger" ellipsis style={{ fontSize: 10, maxWidth: 160 }}>
              {record?.last_error || "Saga rollback completed"}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    case "DEGRADED":
      return <Tag color="warning" icon={<AlertOutlined />}>DEGRADED</Tag>;
    case "INCIDENT":
      return <Tag color="error" icon={<WarningOutlined />}>INCIDENT / OUTAGE</Tag>;
    case "MAINTENANCE":
      return <Tag color="processing" icon={<ClockCircleOutlined />}>MAINTENANCE</Tag>;
    case "SUSPENDED":
      return <Tag color="default">SUSPENDED ($0 FINOPS)</Tag>;
    case "DELETED":
      return <Tag color="default">DELETED</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

export const renderSeverityTag = (sev: string): React.ReactNode => {
  switch (sev) {
    case "SEV-1":
      return <Tag color="#cf1322">SEV-1 CRITICAL</Tag>;
    case "SEV-2":
      return <Tag color="#d46b08">SEV-2 MAJOR</Tag>;
    case "SEV-3":
      return <Tag color="#d4b106">SEV-3 MINOR</Tag>;
    default:
      return <Tag color="#1d39c4">{sev || "NOTICE"}</Tag>;
  }
};
