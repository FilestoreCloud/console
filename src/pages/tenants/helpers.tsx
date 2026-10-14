import React from "react";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  AlertOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export const renderStatusTag = (status: string): React.ReactNode => {
  switch (status) {
    case "ACTIVE":
      return <Tag color="success" icon={<CheckCircleOutlined />}>ACTIVE</Tag>;
    case "DEGRADED":
      return <Tag color="warning" icon={<AlertOutlined />}>DEGRADED</Tag>;
    case "INCIDENT":
      return <Tag color="error" icon={<WarningOutlined />}>INCIDENT / OUTAGE</Tag>;
    case "MAINTENANCE":
      return <Tag color="processing" icon={<ClockCircleOutlined />}>MAINTENANCE</Tag>;
    case "SUSPENDED":
      return <Tag color="default">SUSPENDED ($0 FINOPS)</Tag>;
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
