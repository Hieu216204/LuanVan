import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const SpeedChart = ({ speed = 0, status = 0 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const max = 50;

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const resize = () => chartInstance.current?.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current) return;

    const safeSpeed = Math.min(Math.max(speed, 0), max);
    const isStopped = status === 0;
    const isError = status === 2;
    const displaySpeed = status === 1 ? safeSpeed : 0;

    //  màu
    let activeColor = "#22c55e";
    let remainColor = "#e5e7eb";

    if (status === 0) activeColor = "#9ca3af";

    if (isError) {
      activeColor = "#ef4444";
      remainColor = "#fecaca";
    }

    //  QUAN TRỌNG: scale về 1 nửa
    const percent = displaySpeed / max;

    const option = {
      series: [
        {
          type: "pie",

          // LINE DÀY HƠN
          radius: ["55%", "90%"],

          center: ["50%", "75%"],
          startAngle: 0,
          clockwise: true,
          silent: true,

          label: {
            show: true,
            position: "center",
            formatter: isError
              ? "ERROR"
              : isStopped
                ? "STOPPED"
                : `${safeSpeed} Hz`,
            fontSize: 26,
            fontWeight: "bold",
            color: isError ? "#ef4444" : "#111827",
          },

          labelLine: { show: false },

          data: [
            // nửa trên (ẩn)
            {
              value: 1,
              itemStyle: { color: "transparent" },
              label: { show: false },
            },
            // tốc độ (theo %)
            {
              value: percent,
              itemStyle: {
                color: activeColor,
                borderRadius: 10,
              },
            },

            //  còn lại
            {
              value: 1 - percent,
              itemStyle: {
                color: remainColor,
              },
            },
          ],
        },
      ],

      tooltip: { show: false },
      legend: { show: false },
    };

    chartInstance.current.setOption(option, true);

  }, [speed, status]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "240px" }}
    />
  );
};

export default SpeedChart;