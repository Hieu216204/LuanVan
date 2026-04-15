
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";

const AQILineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://echarts.apache.org/examples/data/asset/data/aqi-beijing.json")
      .then((res) => {
        setData(res.data);
      });
  }, []);

  const option = {
    title: {
      text: "Beijing AQI",
      left: "1%",
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "5%",
      right: "15%",
      bottom: "10%",
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item[0]),
    },
    yAxis: {
      type: "value",
    },
    toolbox: {
      right: 10,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    dataZoom: [
      {
        startValue: "2014-06-01",
      },
      {
        type: "inside",
      },
    ],
    visualMap: {
      top: 50,
      right: 10,
      pieces: [
        { gt: 0, lte: 50, color: "#93CE07" },
        { gt: 50, lte: 100, color: "#FBDB0F" },
        { gt: 100, lte: 150, color: "#FC7D02" },
        { gt: 150, lte: 200, color: "#FD0100" },
        { gt: 200, lte: 300, color: "#AA069F" },
        { gt: 300, color: "#AC3B2A" },
      ],
      outOfRange: {
        color: "#999",
      },
    },
    series: {
      name: "Beijing AQI",
      type: "line",
      data: data.map((item) => item[1]),
      smooth: true,
      markLine: {
        silent: true,
        lineStyle: {
          color: "#333",
        },
        data: [
          { yAxis: 50 },
          { yAxis: 100 },
          { yAxis: 150 },
          { yAxis: 200 },
          { yAxis: 300 },
        ],
      },
    },
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default AQILineChart;