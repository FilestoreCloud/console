import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Bell,
  Send,
  CheckCircle2,
  Save,
  RotateCw,
  AlertTriangle,
  GitBranch,
  Zap,
  Radio,
  Info,
} from "lucide-react";
import { dataProvider } from "../../providers/dataProvider";

export const WebhooksSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    [key: string]: { success: boolean; msg: string };
  }>({});

  // Form values state
  const [enabled, setEnabled] = useState(true);
  const [slackUrl, setSlackUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [pagerdutyKey, setPagerdutyKey] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const [evIncident, setEvIncident] = useState(true);
  const [evCircuit, setEvCircuit] = useState(true);
  const [evClone, setEvClone] = useState(true);
  const [evRestart, setEvRestart] = useState(true);

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
      setEnabled(cfg.enabled ?? true);
      setSlackUrl(cfg.slack_url || "");
      setDiscordUrl(cfg.discord_url || "");
      setPagerdutyKey(cfg.pagerduty_key || "");
      setCustomUrl(cfg.custom_url || "");
      setEvIncident(cfg.events?.incident_declared ?? true);
      setEvCircuit(cfg.events?.circuit_breaker ?? true);
      setEvClone(cfg.events?.tenant_cloned ?? true);
      setEvRestart(cfg.events?.agent_restarted ?? true);
    } catch (err: any) {
      toast.error("Failed to load webhook configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dataProvider.custom) return;
    setIsSaving(true);
    try {
      const payloadConfig = {
        enabled,
        slack_url: slackUrl,
        discord_url: discordUrl,
        pagerduty_key: pagerdutyKey,
        custom_url: customUrl,
        events: {
          incident_declared: evIncident,
          circuit_breaker: evCircuit,
          tenant_cloned: evClone,
          agent_restarted: evRestart,
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
      toast.success("Webhook configuration saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save webhook configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async (type: string, url: string) => {
    if (!dataProvider.custom) return;
    if (!url) {
      toast.warning(`Please enter a valid URL or key for ${type.toUpperCase()}`);
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
        toast.success(
          `${type.toUpperCase()} test alert delivered successfully!`
        );
      } else {
        setTestResults((prev) => ({
          ...prev,
          [type]: { success: false, msg: data.error || "Delivery failed" },
        }));
        toast.error(`${type.toUpperCase()} test failed: ${data.error}`);
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [type]: { success: false, msg: err?.message || "Delivery failed" },
      }));
      toast.error(`Test failed: ${err?.message}`);
    } finally {
      setTestingType(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Webhook Notifications & Incident Alerting
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispatch real-time alerts for SEV-1/SEV-2 incidents, circuit
                breaker trips, tenant clones, and agent restarts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <RotateCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Reload</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Endpoints (8 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Global Dispatch Status */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#1652f0]" />
                <span>Notification Engine Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold text-sm">
                      Master Webhook Notification Dispatcher
                    </Label>
                    <Badge variant="info" className="text-[10px] py-0 px-1.5">
                      Global
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When disabled, all external webhook calls are bypassed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold">
                    {enabled ? "ENABLED" : "DISABLED"}
                  </span>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Radio className="h-4 w-4 text-sky-500" />
                <span>Configured Webhook Endpoints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* 1. Slack */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-base">💬</span>
                    <span>Slack Incoming Webhook</span>
                  </div>
                  {testResults["slack"] && (
                    <Badge
                      variant={
                        testResults["slack"].success ? "success" : "destructive"
                      }
                      className="text-xs"
                    >
                      {testResults["slack"].msg}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 webhook-compact-group">
                  <Input
                    placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingType === "slack"}
                    onClick={() => handleTestWebhook("slack", slackUrl)}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Alert</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 2. Discord */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-base">🎮</span>
                    <span>Discord Webhook</span>
                  </div>
                  {testResults["discord"] && (
                    <Badge
                      variant={
                        testResults["discord"].success ? "success" : "destructive"
                      }
                      className="text-xs"
                    >
                      {testResults["discord"].msg}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 webhook-compact-group">
                  <Input
                    placeholder="https://discord.com/api/webhooks/1234567890/abcdefg..."
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingType === "discord"}
                    onClick={() => handleTestWebhook("discord", discordUrl)}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Alert</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 3. PagerDuty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-base">📟</span>
                    <span>PagerDuty (Events API v2)</span>
                  </div>
                  {testResults["pagerduty"] && (
                    <Badge
                      variant={
                        testResults["pagerduty"].success
                          ? "success"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {testResults["pagerduty"].msg}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 webhook-compact-group">
                  <Input
                    placeholder="32-character PagerDuty Integration / Routing Key"
                    value={pagerdutyKey}
                    onChange={(e) => setPagerdutyKey(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingType === "pagerduty"}
                    onClick={() =>
                      handleTestWebhook("pagerduty", pagerdutyKey)
                    }
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Alert</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 4. Custom Generic Webhook */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Radio className="h-4 w-4 text-emerald-500" />
                    <span>Custom HTTP Webhook Endpoint (JSON)</span>
                  </div>
                  {testResults["custom"] && (
                    <Badge
                      variant={
                        testResults["custom"].success ? "success" : "destructive"
                      }
                      className="text-xs"
                    >
                      {testResults["custom"].msg}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 webhook-compact-group">
                  <Input
                    placeholder="https://api.yourcompany.com/v1/saas-events"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingType === "custom"}
                    onClick={() => handleTestWebhook("custom", customUrl)}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Alert</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Event Subscriptions & Architecture (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subscriptions Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Subscribed Alert Triggers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Accidents &amp; Critical Incidents</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    SEV-1 (Critical) &amp; SEV-2 (Major) events
                  </p>
                </div>
                <Switch
                  checked={evIncident}
                  onCheckedChange={setEvIncident}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <span>Circuit Breaker Transitions</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Status changed to DEGRADED or INCIDENT
                  </p>
                </div>
                <Switch
                  checked={evCircuit}
                  onCheckedChange={setEvCircuit}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <GitBranch className="h-4 w-4 text-purple-500" />
                    <span>Tenant Cloned to Sandbox</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fork Tenant action triggers isolated environment
                  </p>
                </div>
                <Switch checked={evClone} onCheckedChange={setEvClone} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Agent Rolling Restarts</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manual or automated ECS task recreation
                  </p>
                </div>
                <Switch
                  checked={evRestart}
                  onCheckedChange={setEvRestart}
                />
              </div>
            </CardContent>
          </Card>

          {/* Architecture Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-500" />
                <span>Alert Architecture Specification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Alert variant="info" className="text-xs">
                <AlertTitle className="font-semibold text-xs">
                  Non-Blocking Enterprise Reliability
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Webhooks run in an asynchronous, exception-isolated dispatcher
                  with a 3.0-second network timeout. External endpoint latency
                  never blocks tenant operations or control plane APIs.
                </AlertDescription>
              </Alert>

              <div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  Sample Webhook Payload (JSON):
                </p>
                <pre className="rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-slate-200 overflow-x-auto">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};
