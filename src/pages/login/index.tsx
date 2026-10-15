import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Divider,
  Tag,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";

export const LoginPage: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [mfaForm] = Form.useForm();

  // Step 2 MFA Challenge State
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [pendingMfa, setPendingMfa] = useState<{
    challenge_token: string;
    user: string;
    role: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleCredentialsSubmit = async (values: any) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          username: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Invalid administrative credentials.");
        return;
      }
      if (data.status === "MFA_REQUIRED") {
        setPendingMfa({
          challenge_token: data.challenge_token,
          user: data.user,
          role: data.role,
        });
        setStep("mfa");
        mfaForm.resetFields();
      } else if (data.token) {
        localStorage.setItem("saas_admin_token", data.token);
        localStorage.setItem("saas_admin_email", data.user || values.email);
        localStorage.setItem("saas_admin_role", data.role || "SuperAdmin");
        window.location.href = "/tenants";
      } else {
        setErrorMessage(data.error || data.message || "Login failed.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to communicate with control plane.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (values: any) => {
    if (!pendingMfa) return;
    setErrorMessage(null);
    login(
      {
        challenge_token: pendingMfa.challenge_token,
        mfa_code: values.mfa_code,
        email: pendingMfa.user,
      },
      {
        onError: (err: any) => {
          setErrorMessage(err?.message || "Invalid 6-digit verification code.");
        },
      },
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 440,
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          borderRadius: 12,
        }}
        variant="borderless"
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/storix-logo.png"
            alt="Storix"
            style={{ height: 44, marginBottom: 12, objectFit: "contain" }}
          />
          <Title level={3} style={{ marginBottom: 4 }}>
            Storix Super Admin Portal
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Nextcloud Multi-Tenant SaaS Control Plane
          </Text>
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            closable
            onClose={() => setErrorMessage(null)}
          />
        )}

        {step === "credentials" ? (
          <div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCredentialsSubmit}
            >
              <Form.Item
                name="email"
                label={<Text strong>Administrator Email</Text>}
                rules={[
                  { required: true, message: "Please enter your admin email" },
                  { type: "email", message: "Please enter a valid email address" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="admin@example.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong>Master Password / Access Key</Text>}
                extra="Authenticated securely via AWS Cognito User Pool"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="••••••••••••"
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading || isSubmitting}
                style={{
                  backgroundColor: "#1652f0",
                  borderColor: "#1652f0",
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Sign In to Control Plane
              </Button>
            </Form>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Tag
                color="processing"
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 13 }}
              >
                <SafetyCertificateOutlined style={{ marginRight: 6 }} />{" "}
                Two-Factor Authentication
              </Tag>
              <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
                Enter Verification Code
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                A 6-digit verification code has been sent to{" "}
                <strong>{pendingMfa?.user || "nhphuong.code@gmail.com"}</strong>.
                Please check your email inbox and enter the code below.
              </Text>
            </div>

            <Form form={mfaForm} layout="vertical" onFinish={handleMfaSubmit}>
              <Form.Item
                name="mfa_code"
                label={<Text strong>6-Digit Verification Code</Text>}
                rules={[
                  { required: true, message: "Please enter the 6-digit code" },
                  { len: 6, message: "Code must be exactly 6 digits" },
                ]}
              >
                <Input
                  placeholder="000000"
                  size="large"
                  maxLength={6}
                  style={{
                    textAlign: "center",
                    letterSpacing: "0.3em",
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                  autoFocus
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                style={{
                  backgroundColor: "#1652f0",
                  borderColor: "#1652f0",
                  fontWeight: 600,
                  marginTop: 16,
                }}
              >
                Verify &amp; Complete Sign In
              </Button>

              <Button
                type="default"
                block
                style={{ marginTop: 8 }}
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep("credentials")}
              >
                Back to Credentials
              </Button>
            </Form>
          </div>
        )}

        <Divider style={{ margin: "24px 0 12px" }} />
        <div style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            🔒 Secured via AWS IAM, Two-Factor Authentication &amp; DynamoDB
          </Text>
        </div>
      </Card>
    </div>
  );
};
