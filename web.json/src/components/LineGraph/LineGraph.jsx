import React, { useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const LineGraph = ({
  title = "Chart",
  data = [],
  seriesConfig = [],
  visualPieces = [],
  alarmSeries = [],       
  horizontalLines = [],
  showLinePatternInLegend = true,
}) => {
  const chartRef = useRef(null);

  const safeSeriesConfig = (seriesConfig || []).filter(
    (s) => s && typeof s === "object" && s.name && Number.isInteger(s.dataIndex)
  );
  const safeAlarmSeries = (alarmSeries || []).filter(
    (s) => s && typeof s === "object" && s.name && Array.isArray(s.data)
  );

  const validHorizontalLines = horizontalLines
    .map((line) => ({ ...line, value: Number(line?.value) }))
    .filter((line) => Number.isFinite(line.value));

  const seriesColorMap = {
    ...Object.fromEntries(safeSeriesConfig.map((s) => [s.name, s.color || "#5470C6"])),
    ...Object.fromEntries(safeAlarmSeries.map((s) => [s.name, s.color || "#FF0000"])),
  };

  const seriesLineTypeMap = {
    ...Object.fromEntries(safeSeriesConfig.map((s) => [s.name, s.lineType || "solid"])),
    ...Object.fromEntries(safeAlarmSeries.map((s) => [s.name, "dashed"])),
  };

  const legendStyleKeyByName = {};
  const legendRichStyles = {};
  [...safeSeriesConfig, ...safeAlarmSeries].forEach((s, idx) => {
    const key = `s${idx}`;
    legendStyleKeyByName[s.name] = key;
    legendRichStyles[key] = {
    color: seriesColorMap[s.name] || "#5470C6",
    fontWeight: "bold",
    opacity: 1, 
  };
  });

  const baseOption = {
    title: {
      text: title,
      left: "1%",
      textStyle: { fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        if (!items.length) return "";

        const timeLabel = items[0]?.axisValueLabel || items[0]?.axisValue || "";
        const rows = items
          .filter((p) => p?.seriesName)
          .map((p) => {
            const color = seriesColorMap[p.seriesName] || p.color || "#5470C6";
            const value = Array.isArray(p.value) ? p.value[p.value.length - 1] : p.value;
            const displayValue = value == null || value === "" ? "-" : value;
            return `<span style="display:inline-block;margin-right:6px;border-radius:50%;width:9px;height:9px;background:${color};"></span>${p.seriesName}: ${displayValue}`;
          });

        return [timeLabel, ...rows].join("<br/>");
      },
    },
    grid: {
      left: "5%",
      right: "12%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },

    legend: {
  show: true,
  top: 5,
  type: "scroll",
  icon: "none",
  selectedMode: "multiple",

  textStyle: {
    rich: legendRichStyles,
  },

  formatter: function (name) {
    const chart = chartRef.current?.getEchartsInstance();
    const option = chart?.getOption();

    const selected = option?.legend?.[0]?.selected || {};
    const isSelected = selected[name] !== false;

    const titleItem = [...safeSeriesConfig, ...safeAlarmSeries].find(
      (i) => i.name === name
    );
    if (!titleItem) return name;

    const lineType = titleItem.lineType || "solid";
    const pattern =
      showLinePatternInLegend && lineType
        ? lineType === "dashed"
          ? "╌ ╌ ╌"
          : "━━━"
        : "";

    const styleKey = legendStyleKeyByName[name];

    const opacity = isSelected ? 1 : 0.3;

    return `{${styleKey}|${pattern ? `${pattern} ` : ""}${name}}`;
  },
},
    xAxis: {
      type: "category",
      data: data.map((item) => item[0]),
      axisLabel: { rotate: 45, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 12 },
    },
    toolbox: {
      right: 10,
      feature: {
        dataZoom: { yAxisIndex: "none" },
        restore: {},
        saveAsImage: {},
      },
    },
    dataZoom: [
      { startValue: data?.[0]?.[0] },
      { type: "inside" },
    ],

    visualMap: visualPieces?.length
      ? {
          show: false,
          top: 50,
          right: 15,
          pieces: visualPieces,
          outOfRange: { color: "#999999" },
          textStyle: { fontSize: 14 },
          itemWidth: 25,
          itemHeight: 15,
          seriesLayoutBy: "row",
          inSplitArea: false,
        }
      : undefined,

    series: [
      ...safeSeriesConfig.map((s) => ({
        name: s.name,
        type: "line",
        smooth: false,
        data: data.map((item) => item[s.dataIndex]),
        symbol: "none",
        lineStyle: {
          width: s.width || 2.5,
          type: s.lineType || "solid",
          color: seriesColorMap[s.name],
        },
        itemStyle: { color: seriesColorMap[s.name] },
        emphasis: { focus: "series", lineStyle: { width: 4 } },
        z: 5,
      })),

      ...safeAlarmSeries.map((alarm) => ({
        name: alarm.name,
        type: "line",
        step: "end",
        data: alarm.data.map((item) => item[1] ?? 0),
        symbol: "none",
        lineStyle: {
          width: 2.5,
          type: "dashed",
          color: alarm.color || "#FF0000",
        },
        areaStyle: alarm.showArea ? { color: `${alarm.color || "#FF0000"}30` } : undefined,
        z: 10,
      })),

      ...(validHorizontalLines.length > 0
        ? [{
            type: "line",
            markLine: {
              symbol: "none",
              silent: true,
              lineStyle: { width: 2, type: "dashed", color: "#FF0000" },
              label: { show: true, position: "end", formatter: "{b}" },
              data: validHorizontalLines.map((line) => ({
                yAxis: line.value,
                name: line.label || "",
                lineStyle: { color: line.color || "#FF0000", type: "dashed" },
              })),
            },
          }]
        : []),
    ],
  };

  // ================= XỬ LÝ KHI BẤM LEGEND =================
 useEffect(() => {
  const chart = chartRef.current?.getEchartsInstance();
  if (!chart) return;

  const handleLegendSelectChanged = (params) => {
    const selected = params.selected;

    // ===== 1. UPDATE OPACITY CHO LEGEND =====
    const newRich = {};

    [...safeSeriesConfig, ...safeAlarmSeries].forEach((s, idx) => {
      const key = `s${idx}`;
      const isSelected = selected[s.name] !== false;

      newRich[key] = {
        color: seriesColorMap[s.name],
        fontWeight: "bold",
        opacity: isSelected ? 1 : 0.3, 
      };
    });

    // ===== 2. XỬ LÝ VISUAL MAP =====
    const hasVisibleSeries = safeSeriesConfig.some(
      (s) => selected[s.name] !== false
    );

    chart.setOption({
      legend: {
        textStyle: {
          rich: newRich,
        },
      },

      visualMap: visualPieces?.length
        ? hasVisibleSeries
          ? {
              show: true,
              pieces: visualPieces,
              outOfRange: { color: "#999999" },
            }
          : { show: false }
        : undefined,
    });
  };

  chart.on("legendselectchanged", handleLegendSelectChanged);

  return () => {
    chart.off("legendselectchanged", handleLegendSelectChanged);
  };
}, [visualPieces, safeSeriesConfig, safeAlarmSeries]);

  return (
    <ReactECharts
      ref={chartRef}
      option={baseOption}
      style={{ height: 420, width: "100%" }}
      notMerge={true}
    />
  );
};

export default LineGraph;