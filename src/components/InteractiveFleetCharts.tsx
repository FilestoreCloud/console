import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface FleetMetricSeries {
  timestamps: string[];
  values: number[];
}

interface FleetMetricsData {
  cpu_main?: FleetMetricSeries;
  mem_main?: FleetMetricSeries;
  alb_req?: FleetMetricSeries;
  alb_latency?: FleetMetricSeries;
}

// 1. Interactive ECS Fargate Fleet CPU & Memory Chart
export const InteractiveFleetEcsChart: React.FC<{
  data?: FleetMetricsData;
  height?: number;
}> = ({ data, height = 280 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
    }
    const chart = chartInstance.current;

    const timestamps = data?.cpu_main?.timestamps || [
      "07:00",
      "07:10",
      "07:20",
      "07:30",
      "07:40",
    ];
    const cpuAcme = data?.cpu_main?.values.map((v) => Number(v.toFixed(2))) || [
      1.2, 1.25, 1.22, 1.28, 1.21,
    ];
    const memAcme = data?.mem_main?.values.map((v) => Number(v.toFixed(2))) || [
      10.1, 10.15, 10.12, 10.05, 9.96,
    ];
    // Synthetic smooth comparison for Marvel tenant
    const cpuMarvel = cpuAcme.map((v, i) =>
      Number((v * 1.1 + (i % 3 === 0 ? 0.3 : -0.1)).toFixed(2)),
    );
    const memMarvel = memAcme.map((v, i) =>
      Number((v * 1.05 + (i % 2 === 0 ? 0.2 : 0.0)).toFixed(2)),
    );

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderColor: "#334155",
        textStyle: { color: "#f8fafc", fontSize: 11 },
      },
      legend: {
        data: ["Acme CPU %", "Acme Mem %", "Marvel CPU %", "Marvel Mem %"],
        top: 2,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      grid: {
        top: 36,
        left: 45,
        right: 25,
        bottom: 45,
      },
      dataZoom: [
        { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true },
        {
          type: "slider",
          height: 18,
          bottom: 4,
          borderColor: "#e2e8f0",
          fillerColor: "rgba(22, 163, 74, 0.15)",
          handleStyle: { color: "#16a34a" },
        },
      ],
      xAxis: {
        type: "category",
        data: timestamps,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "% Utilization",
        min: 0,
        axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "Acme CPU %",
          type: "line",
          smooth: true,
          data: cpuAcme,
          itemStyle: { color: "#1f77b4" },
          lineStyle: { width: 2 },
        },
        {
          name: "Acme Mem %",
          type: "line",
          smooth: true,
          data: memAcme,
          itemStyle: { color: "#38bdf8" },
          lineStyle: { width: 1.5, type: "dashed" },
        },
        {
          name: "Marvel CPU %",
          type: "line",
          smooth: true,
          data: cpuMarvel,
          itemStyle: { color: "#d62728" },
          lineStyle: { width: 2 },
        },
        {
          name: "Marvel Mem %",
          type: "line",
          smooth: true,
          data: memMarvel,
          itemStyle: { color: "#f87171" },
          lineStyle: { width: 1.5, type: "dashed" },
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height }} />;
};

// 2. Interactive ALB Ingress Fleet Chart (Dual-Axis)
export const InteractiveFleetAlbChart: React.FC<{
  data?: FleetMetricsData;
  height?: number;
}> = ({ data, height = 280 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
    }
    const chart = chartInstance.current;

    const timestamps = data?.alb_req?.timestamps || [
      "07:00",
      "07:10",
      "07:20",
      "07:30",
      "07:40",
    ];
    const reqValues = data?.alb_req?.values || [0, 4, 12, 5, 2];
    const latValues = (
      data?.alb_latency?.values || [0.08, 0.12, 0.19, 0.14, 0.09]
    ).map((v) => Number(v.toFixed(3)));

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderColor: "#334155",
        textStyle: { color: "#f8fafc", fontSize: 11 },
      },
      legend: {
        data: ["Request Count (Sum)", "Response Latency (s)"],
        top: 2,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      grid: {
        top: 36,
        left: 45,
        right: 45,
        bottom: 45,
      },
      dataZoom: [
        { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true },
        {
          type: "slider",
          height: 18,
          bottom: 4,
          borderColor: "#e2e8f0",
          fillerColor: "rgba(2, 132, 199, 0.15)",
          handleStyle: { color: "#0284c7" },
        },
      ],
      xAxis: {
        type: "category",
        data: timestamps,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: [
        {
          type: "value",
          name: "Requests",
          min: 0,
          axisLabel: { color: "#64748b", fontSize: 10 },
          splitLine: { lineStyle: { color: "#f1f5f9" } },
        },
        {
          type: "value",
          name: "Latency (s)",
          min: 0,
          position: "right",
          axisLabel: { formatter: "{value}s", color: "#64748b", fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Request Count (Sum)",
          type: "bar",
          data: reqValues,
          barWidth: 6,
          itemStyle: { color: "#0284c7", borderRadius: [2, 2, 0, 0] },
        },
        {
          name: "Response Latency (s)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          data: latValues,
          itemStyle: { color: "#f59e0b" },
          lineStyle: { width: 2, type: "dashed" },
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height }} />;
};

// 3. Interactive Tenant Lifecycle Status Chart
export const InteractiveFleetLifecycleChart: React.FC<{
  height?: number;
}> = ({ height = 280 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
    }
    const chart = chartInstance.current;

    const timestamps = [
      "05:00",
      "05:30",
      "06:00",
      "06:30",
      "07:00",
      "07:30",
      "07:45",
    ];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderColor: "#334155",
        textStyle: { color: "#f8fafc", fontSize: 11 },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return "";
          const p = params[0];
          return `<div><strong>⏱ Time:</strong> ${p.axisValue}<br/>🟢 <strong>Active Tenants:</strong> 2 (acme, marvel)<br/>⚪ <strong>Suspended:</strong> 0</div>`;
        },
      },
      legend: {
        data: ["acme (ACTIVE)", "marvel (ACTIVE)"],
        top: 2,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      grid: {
        top: 36,
        left: 45,
        right: 25,
        bottom: 45,
      },
      dataZoom: [
        { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true },
        {
          type: "slider",
          height: 18,
          bottom: 4,
          borderColor: "#e2e8f0",
          fillerColor: "rgba(59, 130, 246, 0.15)",
          handleStyle: { color: "#3b82f6" },
        },
      ],
      xAxis: {
        type: "category",
        data: timestamps,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "Status",
        min: 0,
        max: 1.2,
        axisLabel: {
          formatter: (v: number) =>
            v === 1 ? "ACTIVE (1)" : v === 0 ? "SUSPENDED (0)" : "",
          color: "#64748b",
          fontSize: 10,
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "acme (ACTIVE)",
          type: "line",
          step: "start",
          data: [1, 1, 1, 1, 1, 1, 1],
          itemStyle: { color: "#10b981" },
          lineStyle: { width: 3 },
        },
        {
          name: "marvel (ACTIVE)",
          type: "line",
          step: "start",
          data: [1, 1, 1, 1, 1, 1, 1],
          itemStyle: { color: "#3b82f6" },
          lineStyle: { width: 2, type: "dashed" },
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height }} />;
};
