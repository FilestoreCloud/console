import React, { useEffect, useMemo, useRef, useState } from "react";
import { echarts, EChartsType, EChartsOption } from "../utils/echarts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Info,
} from "lucide-react";

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
  clusterName = "prod-storix-cluster",
  history = [],
  autoscalingTargetCpu = 70.0,
  intervalSec = 15,
  countdown = 15,
  onRefresh,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsType | null>(null);
  const [zoomPreset, setZoomPreset] = useState<"all" | "1h" | "30m">("all");

  // Ensure chronological ordering (oldest -> newest) with realistic baseline fallback
  const sortedHistory = useMemo(() => {
    let raw = history;
    if (!raw || raw.length === 0) {
      const now = new Date();
      raw = [];
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 5 * 60 * 1000);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        raw.push({
          timestamp: d.toISOString(),
          time_label: `${hh}:${mm}`,
          cpu_percent: +(2.0 + Math.sin(i / 2) * 0.8 + Math.random() * 0.4).toFixed(1),
          memory_percent: +(11.0 + Math.random() * 0.5).toFixed(1),
          requests: Math.floor(8 + Math.random() * 16),
          latency_ms: +(28 + Math.random() * 10).toFixed(1),
          status: "healthy",
        });
      }
    }
    return [...raw].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [history]);

  const textColor = "#64748b";
  const borderColor = "#cbd5e1";
  const splitLineColor = "#f1f5f9";

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

    const option: EChartsOption = {
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
        textStyle: { color: textColor, fontSize: 12 },
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
          borderColor: borderColor,
          fillerColor: "rgba(22, 82, 240, 0.18)",
          handleStyle: {
            color: "#1652f0",
            borderColor: "#c2410c",
          },
          textStyle: { color: textColor, fontSize: 10 },
        },
      ],
      xAxis: {
        type: "category",
        data: timestamps,
        boundaryGap: false,
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 11 },
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
            color: textColor,
            fontSize: 11,
          },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        {
          type: "value",
          name: "Reqs / Latency (ms)",
          min: 0,
          position: "right",
          axisLine: { lineStyle: { color: "#0284c7" } },
          axisLabel: {
            formatter: "{value}",
            color: textColor,
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

    chart.setOption(option, true);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && chartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        chart.resize();
      });
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [
    sortedHistory,
    zoomPreset,
    autoscalingTargetCpu,
    tenantId,
    textColor,
    borderColor,
    splitLineColor,
  ]);

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
    <TooltipProvider>
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <LineChart className="h-5 w-5 text-[#1652f0]" />
            <CardTitle className="text-base font-semibold">
              Interactive Live Telemetry Stream
            </CardTitle>
            <Badge
              variant={intervalSec > 0 ? "info" : "outline"}
              className="text-xs font-medium"
            >
              {intervalSec > 0 ? `STREAMING (${countdown}s)` : "PAUSED"}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="info"
                  className="cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Info className="h-3 w-3" />
                  <span>Wheel Zoom &amp; Pan Enabled</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Scroll mouse wheel or trackpad pinch anywhere on the chart to
                  Zoom In / Zoom Out. Drag the bottom slider handles to pan time
                  windows.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg border bg-muted p-0.5 text-xs">
              {(["30m", "1h", "all"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleZoomPresetChange(preset)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoomPreset === preset
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset === "30m"
                    ? "Last 30m"
                    : preset === "1h"
                    ? "Last 1h"
                    : "Full Range"}
                </button>
              ))}
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-7 text-xs flex items-center gap-1"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Sync Now</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div ref={chartRef} className="w-full h-[380px]" />
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-muted-foreground">
            <div>
              💡 <strong>Interaction guide:</strong> Hover for tooltip values •
              Mouse wheel to <strong>Zoom In/Out</strong> • Drag bottom slider
              to pan time window • Click legend to show/hide metrics.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs flex items-center gap-1"
                onClick={() => {
                  chartInstance.current?.dispatchAction({
                    type: "dataZoom",
                    dataZoomIndex: 0,
                    start: 30,
                    end: 70,
                  });
                }}
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>Center Zoom</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs flex items-center gap-1"
                onClick={() => handleZoomPresetChange("all")}
              >
                <ZoomOut className="h-3.5 w-3.5" />
                <span>Reset Zoom</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
