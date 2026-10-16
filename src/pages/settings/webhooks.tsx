import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Divider,
  message,
  Tooltip,
} from "antd";
import {
  BellOutlined,
  SendOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  SlackOutlined,
  ApiOutlined,
  WarningOutlined,
  SyncOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../providers/dataProvider";

const { Title, Text, Paragraph } = Typography;

export const WebhooksSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    [key: string]: { success: boolean; msg: string };
  }>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    if (!dataProvider.custom) return;
    setIsLoading(true);
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: { action: "GET_WEBHOOK_CONFIG" },
      });
      const cfg = res.data?.config || {};
      form.setFieldsValue({
        enabled: cfg.enabled ?? true,
        slack_url: cfg.slack_url || "",
        discord_url: cfg.discord_url || "",
        pagerduty_key: cfg.pagerduty_key || "",
        custom_url: cfg.custom_url || "",
        ev_incident: cfg.events?.incident_declared ?? true,
        ev_circuit: cfg.events?.circuit_breaker ?? true,
        ev_clone: cfg.events?.tenant_cloned ?? true,
        ev_restart: cfg.events?.agent_restarted ?? true,
      });
    } catch (err: any) {
      message.error("Failed to load webhook configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!dataProvider.custom) return;
    setIsSaving(true);
    try {
      const payloadConfig = {
        enabled: values.enabled,
        slack_url: values.slack_url,
        discord_url: values.discord_url,
        pagerduty_key: values.pagerduty_key,
        custom_url: values.custom_url,
        events: {
          incident_declared: values.ev_incident,
          circuit_breaker: values.ev_circuit,
          tenant_cloned: values.ev_clone,
          agent_restarted: values.ev_restart,
        },
      };
      await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "SAVE_WEBHOOK_CONFIG",
          config: payloadConfig,
        },
      });
      message.success("Webhook configuration saved successfully!");
    } catch (err: any) {
      message.error(err?.message || "Failed to save webhook configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async (type: string, url: string) => {
    if (!dataProvider.custom) return;
    if (!url) {
      message.warning(
        `Please enter a valid URL or key for ${type.toUpperCase()}`,
      );
      return;
    }
    setTestingType(type);
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "TEST_WEBHOOK",
          webhook_type: type,
          webhook_url: url,
        },
      });
      const data = res.data;
      if (data.success) {
        setTestResults((prev) => ({
          ...prev,
          [type]: {
            success: true,
            msg: data.message || "Test delivered (HTTP 200)",
          },
        }));
        message.success(
          `${type.toUpperCase()} test alert delivered successfully!`,
        );
      } else {
        setTestResults((prev) => ({
          ...prev,
          [type]: { success: false, msg: data.error || "Delivery failed" },
        }));
        message.error(`${type.toUpperCase()} test failed: ${data.error}`);
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [type]: { success: false, msg: err?.message || "Delivery failed" },
      }));
      message.error(`Test failed: ${err?.message}`);
    } finally {
      setTestingType(null);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <Card
        style={{ marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" size={12}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BellOutlined style={{ fontSize: 24, color: "#d97706" }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Webhook Notifications & Incident Alerting
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Dispatch real-time alerts for SEV-1/SEV-2 incidents, circuit
                  breaker trips, tenant clones, and agent restarts.
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={loadConfig}
                loading={isLoading}
              >
                Reload
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isSaving}
                onClick={() => form.submit()}
                style={{ background: "#1652f0", borderColor: "#1652f0" }}
              >
                Save Configuration
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          {/* Left Column: Notification Endpoints */}
          <Col xs={24} lg={15}>
            {/* Global Dispatch Status */}
            <Card
              title={
                <Space>
                  <BellOutlined style={{ color: "#1652f0" }} />
                  <span>Notification Engine Control</span>
                </Space>
              }
              variant="borderless"
              style={{
                marginBottom: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Form.Item
                name="enabled"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
                label={
                  <Space>
                    <strong>Master Webhook Notification Dispatcher</strong>
                    <Tooltip title="When disabled, all external webhook calls are bypassed">
                      <Tag color="blue">Global</Tag>
                    </Tooltip>
                  </Space>
                }
              >
                <Switch
                  checkedChildren="ENABLED"
                  unCheckedChildren="DISABLED"
                />
              </Form.Item>
            </Card>

            {/* Endpoints */}
            <Card
              title={
                <Space>
                  <ApiOutlined style={{ color: "#0284c7" }} />
                  <span>Configured Webhook Endpoints</span>
                </Space>
              }
              variant="borderless"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
            >
              {/* 1. Slack */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <SlackOutlined style={{ fontSize: 18, color: "#4a154b" }} />
                    <strong style={{ fontSize: 14 }}>
                      Slack Incoming Webhook
                    </strong>
                  </Space>
                  {testResults["slack"] && (
                    <Tag
                      color={testResults["slack"].success ? "success" : "error"}
                    >
                      {testResults["slack"].msg}
                    </Tag>
                  )}
                </div>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="slack_url"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX" />
                  </Form.Item>
                  <Button
                    icon={<SendOutlined />}
                    loading={testingType === "slack"}
                    onClick={() =>
                      handleTestWebhook(
                        "slack",
                        form.getFieldValue("slack_url"),
                      )
                    }
                  >
                    Send Test Alert
                  </Button>
                </Space.Compact>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* 2. Discord */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 16 }}>🎮</span>
                    <strong style={{ fontSize: 14 }}>Discord Webhook</strong>
                  </Space>
                  {testResults["discord"] && (
                    <Tag
                      color={
                        testResults["discord"].success ? "success" : "error"
                      }
                    >
                      {testResults["discord"].msg}
                    </Tag>
                  )}
                </div>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="discord_url"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="https://discord.com/api/webhooks/1234567890/abcdefg..." />
                  </Form.Item>
                  <Button
                    icon={<SendOutlined />}
                    loading={testingType === "discord"}
                    onClick={() =>
                      handleTestWebhook(
                        "discord",
                        form.getFieldValue("discord_url"),
                      )
                    }
                  >
                    Send Test Alert
                  </Button>
                </Space.Compact>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* 3. PagerDuty */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 16 }}>📟</span>
                    <strong style={{ fontSize: 14 }}>
                      PagerDuty (Events API v2)
                    </strong>
                  </Space>
                  {testResults["pagerduty"] && (
                    <Tag
                      color={
                        testResults["pagerduty"].success ? "success" : "error"
                      }
                    >
                      {testResults["pagerduty"].msg}
                    </Tag>
                  )}
                </div>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="pagerduty_key"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="32-character PagerDuty Integration / Routing Key" />
                  </Form.Item>
                  <Button
                    icon={<SendOutlined />}
                    loading={testingType === "pagerduty"}
                    onClick={() =>
                      handleTestWebhook(
                        "pagerduty",
                        form.getFieldValue("pagerduty_key"),
                      )
                    }
                  >
                    Send Test Alert
                  </Button>
                </Space.Compact>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* 4. Custom Generic Webhook */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <ApiOutlined style={{ fontSize: 16, color: "#10b981" }} />
                    <strong style={{ fontSize: 14 }}>
                      Custom HTTP Webhook Endpoint (JSON)
                    </strong>
                  </Space>
                  {testResults["custom"] && (
                    <Tag
                      color={
                        testResults["custom"].success ? "success" : "error"
                      }
                    >
                      {testResults["custom"].msg}
                    </Tag>
                  )}
                </div>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="custom_url"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="https://api.yourcompany.com/v1/saas-events" />
                  </Form.Item>
                  <Button
                    icon={<SendOutlined />}
                    loading={testingType === "custom"}
                    onClick={() =>
                      handleTestWebhook(
                        "custom",
                        form.getFieldValue("custom_url"),
                      )
                    }
                  >
                    Send Test Alert
                  </Button>
                </Space.Compact>
              </div>
            </Card>
          </Col>

          {/* Right Column: Event Subscriptions & Sample Payloads */}
          <Col xs={24} lg={9}>
            {/* Subscriptions Card */}
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: "#10b981" }} />
                  <span>Subscribed Alert Triggers</span>
                </Space>
              }
              variant="borderless"
              style={{
                marginBottom: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Space>
                      <WarningOutlined style={{ color: "#ef4444" }} />
                      <strong>Accidents & Critical Incidents</strong>
                    </Space>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      SEV-1 (Critical) & SEV-2 (Major) events
                    </div>
                  </div>
                  <Form.Item
                    name="ev_incident"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                </div>

                <Divider style={{ margin: 0 }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Space>
                      <BellOutlined style={{ color: "#f59e0b" }} />
                      <strong>Circuit Breaker Transitions</strong>
                    </Space>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Status changed to DEGRADED or INCIDENT
                    </div>
                  </div>
                  <Form.Item
                    name="ev_circuit"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                </div>

                <Divider style={{ margin: 0 }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Space>
                      <BranchesOutlined style={{ color: "#8b5cf6" }} />
                      <strong>Tenant Cloned to Sandbox</strong>
                    </Space>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Fork Tenant action triggers isolated environment
                    </div>
                  </div>
                  <Form.Item
                    name="ev_clone"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                </div>

                <Divider style={{ margin: 0 }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Space>
                      <ThunderboltOutlined style={{ color: "#1652f0" }} />
                      <strong>Agent Rolling Restarts</strong>
                    </Space>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Manual or automated ECS task recreation
                    </div>
                  </div>
                  <Form.Item
                    name="ev_restart"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </Space>
            </Card>

            {/* Architecture Card */}
            <Card
              title={
                <Space>
                  <ApiOutlined style={{ color: "#6366f1" }} />
                  <span>Alert Architecture Specification</span>
                </Space>
              }
              variant="borderless"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
            >
              <Alert
                type="info"
                showIcon
                message="Non-Blocking Enterprise Reliability"
                description="Webhooks run in an asynchronous, exception-isolated dispatcher with a 3.0-second network timeout. External endpoint latency never blocks tenant operations or control plane APIs."
                style={{ fontSize: 12, marginBottom: 12 }}
              />

              <Text strong style={{ fontSize: 12 }}>
                Sample Webhook Payload (JSON):
              </Text>
              <pre
                style={{
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "monospace",
                  marginTop: 6,
                  overflowX: "auto",
                }}
              >
                {`{
  "event": "INCIDENT_DECLARED",
  "tenant_id": "acme",
  "environment": "prod",
  "timestamp": "2026-10-12T10:00:00Z",
  "data": {
    "severity": "SEV-1",
    "status": "INCIDENT",
    "title": "Database Connection Saturation",
    "reported_by": "SuperAdmin"
  }
}`}
              </pre>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
