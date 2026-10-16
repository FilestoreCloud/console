import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { WebhooksSettings } from "../webhooks";
import { dataProvider } from "../../../providers/dataProvider";

vi.mock("../../../providers/dataProvider", () => ({
  dataProvider: {
    getApiUrl: vi.fn().mockReturnValue("https://api.storix.cloud"),
    custom: vi.fn().mockResolvedValue({
      data: {
        config: {
          enabled: true,
          slack_url: "https://hooks.slack.com/services/mock",
          discord_url: "",
          pagerduty_key: "",
          custom_url: "",
          events: {
            incident_declared: true,
            circuit_breaker: true,
            tenant_cloned: true,
            agent_restarted: true,
          },
        },
      },
    }),
  },
}));

describe("WebhooksSettingsPage — Platform Incident & Alert Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <WebhooksSettings />
      </BrowserRouter>,
    );
  };

  it("renders webhook configuration form and endpoints", async () => {
    renderComponent();
    expect(screen.getByText("Webhook Notifications & Incident Alerting")).toBeInTheDocument();
    expect(screen.getByText("Slack Incoming Webhook")).toBeInTheDocument();
    expect(screen.getByText("Discord Webhook")).toBeInTheDocument();
    expect(screen.getByText("PagerDuty (Events API v2)")).toBeInTheDocument();

    await waitFor(() => {
      expect(dataProvider.custom).toHaveBeenCalled();
    });
  });
});
