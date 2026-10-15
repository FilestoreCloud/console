import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Card, Space, Button, Tag, Typography, Radio, Tooltip } from "antd";
import {
  LineChartOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export interface TelemetryPoint {
  timestamp: string;
  time_label?: string;
  cpu_percent: number;
  memory_percent: number;
  requests: number;
  latency_ms: number;
  status?: string;
}

interface InteractiveMetricsChartProps {
  tenantId: string;
  clusterName?: string;
  history?: TelemetryPoint[];
  autoscalingTargetCpu?: number;
  intervalSec?: number;
  countdown?: number;
  onRefresh?: () => void;
}

export const InteractiveMetricsChart: React.FC<
  InteractiveMetricsChartProps
> = ({
  tenantId,
  clusterName = "prod-nextcloud-cluster",
  history = [],
  autoscalingTargetCpu = 70.0,
  intervalSec = 15,
  countdown = 15,
  onRefresh,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);
  const [zoomPreset, setZoomPreset] = useState<"all" | "1h" | "30m">("all");

  // Ensure chronological ordering (oldest -> newest)
  const sortedHistory = [...history].reverse();

  // Initialize ECharts instance
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
    }

    const chart = chartInstance.current;

    const timestamps = sortedHistory.map((h) => h.time_label || h.timestamp);
    const cpuData = sortedHistory.map((h) => h.cpu_percent);
    const memData = sortedHistory.map((h) => h.memory_percent);
    const reqData = sortedHistory.map((h) => h.requests);
    const latData = sortedHistory.map((h) => h.latency_ms);

    // Calculate initial dataZoom range based on preset
    let zoomStart = 0;
    if (zoomPreset === "30m" && timestamps.length > 6) {
      zoomStart = Math.max(0, 100 - (6 / timestamps.length) * 100);
    } else if (zoomPreset === "1h" && timestamps.length > 12) {
      zoomStart = Math.max(0, 100 - (12 / timestamps.length) * 100);
    }

    const option: echarts.EChartsOption = {
      animationDuration: 500,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: { color: "#94a3b8" },
        },
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderColor: "#334155",
        textStyle: { color: "#f8fafc", fontSize: 12 },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return "";
          const header = `<div style="font-weight:600;margin-bottom:6px;border-bottom:1px solid #334155;padding-bottom:4px;">⏱ Time: ${params[0].axisValue}</div>`;
          const rows = params
            .map((p: any) => {
              const unit = p.seriesName.includes("%")
                ? "%"
                : p.seriesName.includes("Latency")
                  ? " ms"
                  : " req";
              return `<div style="display:flex;justify-content:space-between;gap:16px;margin:3px 0;">
                <span style="color:${p.color}">${p.marker} ${p.seriesName}:</span>
                <span style="font-weight:600;font-family:monospace">${p.value}${unit}</span>
              </div>`;
            })
            .join("");
          return `${header}${rows}`;
        },
      },
      legend: {
        data: [
          "CPU Utilization (%)",
          "Memory Usage (%)",
          "ALB Ingress (Requests)",
          "Target Latency (ms)",
        ],
        top: 4,
        textStyle: { color: "#475569", fontSize: 12 },
      },
      grid: {
        top: 50,
        left: 55,
        right: 65,
        bottom: 56,
        containLabel: false,
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none",
            title: { zoom: "Box Zoom", back: "Reset" },
          },
          restore: { title: "Restore" },
          saveAsImage: {
            title: "Download PNG",
            name: `tenant_${tenantId}_metrics`,
            pixelRatio: 2,
          },
        },
        right: 16,
        top: 2,
      },
      dataZoom: [
        {
          type: "inside",
          start: zoomStart,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        },
        {
          type: "slider",
          start: zoomStart,
          end: 100,
          height: 22,
          bottom: 12,
          borderColor: "#e2e8f0",
          fillerColor: "rgba(22, 82, 240, 0.18)",
          handleStyle: {
            color: "#1652f0",
            borderColor: "#c2410c",
          },
          textStyle: { color: "#64748b", fontSize: 10 },
        },
      ],
      xAxis: {
        type: "category",
        data: timestamps,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
      },
      yAxis: [
        {
          type: "value",
          name: "Utilization (%)",
          min: 0,
          max: 100,
          position: "left",
          axisLine: { lineStyle: { color: "#10b981" } },
          axisLabel: {
            formatter: "{value}%",
            color: "#64748b",
            fontSize: 11,
          },
          splitLine: { lineStyle: { color: "#f1f5f9" } },
        },
        {
          type: "value",
          name: "Reqs / Latency (ms)",
          min: 0,
          position: "right",
          axisLine: { lineStyle: { color: "#0284c7" } },
          axisLabel: {
            formatter: "{value}",
            color: "#64748b",
            fontSize: 11,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "CPU Utilization (%)",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: cpuData,
          itemStyle: { color: "#10b981" },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16, 185, 129, 0.35)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.02)" },
            ]),
          },
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              {
                yAxis: autoscalingTargetCpu,
                lineStyle: { color: "#ef4444", type: "dashed", width: 1.5 },
                label: {
                  formatter: `Autoscale Target (${autoscalingTargetCpu}%)`,
                  position: "insideEndTop",
                  color: "#ef4444",
                  fontSize: 11,
                  fontWeight: "bold",
                },
              },
            ],
          },
        },
        {
          name: "Memory Usage (%)",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: memData,
          itemStyle: { color: "#8b5cf6" },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(139, 92, 246, 0.25)" },
              { offset: 1, color: "rgba(139, 92, 246, 0.01)" },
            ]),
          },
        },
        {
          name: "ALB Ingress (Requests)",
          type: "bar",
          yAxisIndex: 1,
          data: reqData,
          barWidth: 8,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#38bdf8" },
              { offset: 1, color: "#0284c7" },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        },
        {
          name: "Target Latency (ms)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          data: latData,
          itemStyle: { color: "#f59e0b" },
          lineStyle: { width: 1.5, type: "dashed" },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sortedHistory, zoomPreset, autoscalingTargetCpu, tenantId]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const handleZoomPresetChange = (preset: "all" | "1h" | "30m") => {
    setZoomPreset(preset);
    if (!chartInstance.current || sortedHistory.length === 0) return;

    let start = 0;
    if (preset === "30m" && sortedHistory.length > 6) {
      start = Math.max(0, 100 - (6 / sortedHistory.length) * 100);
    } else if (preset === "1h" && sortedHistory.length > 12) {
      start = Math.max(0, 100 - (12 / sortedHistory.length) * 100);
    }

    chartInstance.current.dispatchAction({
      type: "dataZoom",
      start,
      end: 100,
    });
  };

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined style={{ color: "#1652f0" }} />
          <span>Interactive Live Telemetry Stream</span>
          <Tag color={intervalSec > 0 ? "processing" : "default"}>
            {intervalSec > 0 ? `STREAMING (${countdown}s)` : "PAUSED"}
          </Tag>
          <Tooltip title="Scroll mouse wheel or trackpad pinch anywhere on the chart to Zoom In / Zoom Out. Drag the bottom slider handles to pan time windows.">
            <Tag
              icon={<InfoCircleOutlined />}
              color="cyan"
              style={{ cursor: "pointer" }}
            >
              Wheel Zoom & Pan Enabled
            </Tag>
          </Tooltip>
        </Space>
      }
      extra={
        <Space wrap>
          <Radio.Group
            size="small"
            value={zoomPreset}
            onChange={(e) => handleZoomPresetChange(e.target.value)}
          >
            <Radio.Button value="30m">Last 30m</Radio.Button>
            <Radio.Button value="1h">Last 1h</Radio.Button>
            <Radio.Button value="all">Full Range</Radio.Button>
          </Radio.Group>

          {onRefresh && (
            <Button size="small" icon={<ReloadOutlined />} onClick={onRefresh}>
              Sync Now
            </Button>
          )}
        </Space>
      }
      variant="borderless"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <div>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: 380,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
            padding: "0 12px",
          }}
        >
          <Text type="secondary" style={{ fontSize: 11 }}>
            💡 <strong>Interaction guide:</strong> Hover for tooltip values •
            Mouse wheel to <strong>Zoom In/Out</strong> • Drag bottom slider to
            pan time window • Click legend to show/hide metrics.
          </Text>
          <Space size={8}>
            <Button
              size="small"
              type="text"
              icon={<ZoomInOutlined />}
              onClick={() => {
                chartInstance.current?.dispatchAction({
                  type: "dataZoom",
                  dataZoomIndex: 0,
                  start: 30,
                  end: 70,
                });
              }}
            >
              Center Zoom
            </Button>
            <Button
              size="small"
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={() => handleZoomPresetChange("all")}
            >
              Reset Zoom
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};
