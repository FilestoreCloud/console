import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  message,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ThunderboltFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Browser-based pure RFC 6238 TOTP generator for evaluation assistant
async function computeTotpInBrowser(secretBase32: string): Promise<string> {
  try {
    const cleanSecret = secretBase32.replace(/[\s=]/g, "").toUpperCase();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (let i = 0; i < cleanSecret.length; i++) {
      const val = alphabet.indexOf(cleanSecret.charAt(i));
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    const key = await crypto.subtle.importKey(
      "raw",
      bytes,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counter, false);
    const sig = await crypto.subtle.sign("HMAC", key, counterBuffer);
    const sigBytes = new Uint8Array(sig);
    const offset = sigBytes[sigBytes.length - 1] & 0x0f;
    const codeVal =
      (((sigBytes[offset] & 0x7f) << 24) |
        ((sigBytes[offset + 1] & 0xff) << 16) |
        ((sigBytes[offset + 2] & 0xff) << 8) |
        (sigBytes[offset + 3] & 0xff)) %
      1000000;
    return codeVal.toString().padStart(6, "0");
  } catch (err) {
    console.error("TOTP computation error:", err);
    return "";
  }
}

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
    demo_totp_secret: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillPersona = () => {
    form.setFieldsValue({
      email: "admin@png261.dev",
      password: "AdminPassword123!",
    });
  };

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
          demo_totp_secret: data.demo_totp_secret,
        });
        setStep("mfa");
        mfaForm.resetFields();
      } else if (data.token) {
        sessionStorage.setItem("saas_admin_token", data.token);
        sessionStorage.setItem("saas_admin_email", data.user || values.email);
        sessionStorage.setItem("saas_admin_role", data.role || "SuperAdmin");
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
          setErrorMessage(err?.message || "Invalid 6-digit TOTP code.");
        },
      },
    );
  };

  const autoGenerateTotp = async () => {
    if (!pendingMfa?.demo_totp_secret) return;
    const code = await computeTotpInBrowser(pendingMfa.demo_totp_secret);
    if (code) {
      mfaForm.setFieldValue("mfa_code", code);
      message.success(`Calculated RFC 6238 TOTP code: ${code}`);
    }
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
        bordered={false}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☁️</div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Super Admin Portal
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
              initialValues={{
                email: "admin@png261.dev",
                password: "AdminPassword123!",
              }}
            >
              <Form.Item
                name="email"
                label={<Text strong>Administrator Email</Text>}
                rules={[
                  { required: true, message: "Please enter your admin email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="admin@png261.dev"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong>Master Password / Access Key</Text>}
                extra="Verified via PBKDF2 (100k rounds) & AWS Secrets Manager"
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
                  backgroundColor: "#ec7211",
                  borderColor: "#ec7211",
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Sign In to Control Plane
              </Button>
            </Form>

            <Divider style={{ margin: "24px 0 16px" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                DEMO QUICK-FILL
              </Text>
            </Divider>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                style={{
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={fillPersona}
              >
                <span>
                  <SafetyCertificateOutlined
                    style={{ color: "#ef4444", marginRight: 8 }}
                  />
                  <strong>SuperAdmin</strong> (Full Access)
                </span>
                <Tag color="error">admin@png261.dev</Tag>
              </Button>
            </Space>
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
                Enter Authenticator Code
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Signing in as <strong>{pendingMfa?.user}</strong> (
                {pendingMfa?.role})
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

              {/* Demo TOTP Assistant */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Demo Secret:
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, fontSize: 12 }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pendingMfa?.demo_totp_secret || "",
                      );
                      message.success("Secret copied to clipboard");
                    }}
                  >
                    Copy Secret
                  </Button>
                </div>
                <Text
                  code
                  style={{
                    fontSize: 11,
                    display: "block",
                    wordBreak: "break-all",
                  }}
                >
                  {pendingMfa?.demo_totp_secret}
                </Text>
                <Button
                  icon={<ThunderboltFilled style={{ color: "#ec7211" }} />}
                  size="small"
                  block
                  style={{ marginTop: 8 }}
                  onClick={autoGenerateTotp}
                >
                  Auto-Generate Valid TOTP Code
                </Button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                style={{
                  backgroundColor: "#ec7211",
                  borderColor: "#ec7211",
                  fontWeight: 600,
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
            🔒 Secured via AWS IAM, RFC 6238 TOTP &amp; DynamoDB
          </Text>
        </div>
      </Card>
    </div>
  );
};
