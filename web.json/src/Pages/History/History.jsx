import React, { useMemo, useState } from "react";
import History_Table from "../../components/History_Table";
import LineGraph from "../../components/LineGraph";
import { getHistoryByRange } from "./data";

const mergeData = (qtdv = [], qtdr = [], field) => {
  const allTimes = [...new Set([
    ...qtdv.map((i) => i.Date_Time),
    ...qtdr.map((i) => i.Date_Time),
  ])].sort();

  return allTimes.map((time) => {
    const dv = qtdv.find((i) => i.Date_Time === time);
    const dr = qtdr.find((i) => i.Date_Time === time);
    return [time, dv ? dv[field] : null, dr ? dr[field] : null];
  });
};

const mapSingle = (rows = [], field) => rows.map((item) => [item.Date_Time, item[field] ?? null]);

const toFiniteNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getLatestAlarmValue = (alarmArray) => {
  if (!alarmArray || alarmArray.length === 0) return 0;
  return Number(alarmArray[alarmArray.length - 1][1]) || 0;
};

function History() {
  const [data, setData] = useState({
    input: [],
    output: [],
    pump: [],
    event: [],
    motor: [],
    alarms: [],
  });
  const [hasQueried, setHasQueried] = useState(false);

  const charts = useMemo(() => {
    const dataPH = mergeData(data.input, data.output, "pH");
    const dataCLO = mergeData(data.input, data.output, "CLO");
    const dataNTU = mergeData(data.input, data.output, "NTU");

    const dataPress = mapSingle(data.pump, "Pressure");
    const dataLevel = mapSingle(data.pump, "Level");
    const dataFlow = mapSingle(data.pump, "FlowRate");
    const dataSpeed = (data.motor || []).map((item) => [
      item.Date_Time,
      item.Motor1 ?? 0,
      item.Motor2 ?? 0,
      item.Motor3 ?? 0,
    ]);

    const pHLow = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.pH_low_set)]);
    const cloHigh = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.CLO_high_set)]);
    const ntuHigh = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.NTU_high_set)]);

    const pressLow = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.Press_low)]);
    const pressHigh = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.Press_high)]);
    const levelLow = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.Level_low)]);
    const levelHigh = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.Level_high)]);
    const runPump = (data.alarms || []).map((item) => [item.Date_Time, toFiniteNumber(item.Run_pump)]);

    const pHLowVal = getLatestAlarmValue(pHLow);
    const cloHighVal = getLatestAlarmValue(cloHigh);
    const ntuHighVal = getLatestAlarmValue(ntuHigh);
    const pressLowVal = getLatestAlarmValue(pressLow);
    const pressHighVal = getLatestAlarmValue(pressHigh);
    const levelLowVal = getLatestAlarmValue(levelLow);
    const levelHighVal = getLatestAlarmValue(levelHigh);

    const pressDataMax = Math.max(
      ...dataPress.map(([, v]) => toFiniteNumber(v, 0)),
      pressHighVal,
      pressLowVal,
      0
    );

    const levelDataMax = Math.max(
      ...dataLevel.map(([, v]) => toFiniteNumber(v, 0)),
      levelHighVal,
      levelLowVal,
      0
    );

    return {
      dataPH,
      dataCLO,
      dataNTU,
      dataPress,
      dataLevel,
      dataFlow,
      dataSpeed,
      pHLow,
      cloHigh,
      ntuHigh,
      pressLow,
      pressHigh,
      levelLow,
      levelHigh,
      runPump,
      visualPH: [
        { gt: 0, lte: pHLowVal, color: "#FF0000" },
        { gt: pHLowVal, lte: 14, color: "#0000FF" },
      ],
      visualCLO: [
        { gt: 0, lte: cloHighVal, color: "#0000FF" },
        { gt: cloHighVal, lte: 5, color: "#FF0000" },
      ],
      visualNTU: [
        { gt: 0, lte: ntuHighVal, color: "#0000FF" },
        { gt: ntuHighVal, lte: 5, color: "#FF0000" },
      ],
      visualPress: [
        { gt: 0, lte: pressLowVal, color: "#FF0000" },
        { gt: pressLowVal, lte: pressHighVal, color: "#0000FF" },
        { gt: pressHighVal, lte: pressDataMax + 5, color: "#FF0000" },
      ],
      visualLevel: [
        { gt: 0, lte: levelLowVal, color: "#FF0000" },
        { gt: levelLowVal, lte: levelHighVal, color: "#0000FF" },
        { gt: levelHighVal, lte: levelDataMax + 5, color: "#FF0000" },
      ],
    };
  }, [data]);

  const hasChartData = useMemo(() => {
    return (
      charts.dataPH.length > 0 ||
      charts.dataCLO.length > 0 ||
      charts.dataNTU.length > 0 ||
      charts.dataPress.length > 0 ||
      charts.dataLevel.length > 0 ||
      charts.dataFlow.length > 0 ||
      charts.dataSpeed.length > 0
    );
  }, [charts]);

  const handleQuery = async (fromTime, toTime) => {
    const nextData = await getHistoryByRange(fromTime, toTime);
    setData(nextData);
    setHasQueried(true);
  };

  return (
    <div className="history w-full min-w-0">
      <History_Table data={data} onQuery={handleQuery} />

      {hasQueried && (
        <div className="w-full p-4 bg-gray-50">
          {!hasChartData ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-600">
              Không có dữ liệu biểu đồ trong khoảng thời gian đã truy xuất.
            </div>
          ) : (
            <div className="max-w-9xl mx-auto space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số pH"
                  data={charts.dataPH}
                  seriesConfig={[
                    { name: "PH_in", dataIndex: 1, lineType: "solid", color: "#0000FF" },
                    { name: "PH_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" },
                  ]}
                  visualPieces={charts.visualPH}
                  alarmSeries={[
                    { name: "pH Low Alarm", data: charts.pHLow, color: "#FF9800", lineType: "dashed" },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số CLO"
                  data={charts.dataCLO}
                  seriesConfig={[
                    { name: "CLO_in", dataIndex: 1, lineType: "solid", color: "#0000FF" },
                    { name: "CLO_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" },
                  ]}
                  visualPieces={charts.visualCLO}
                  alarmSeries={[
                    { name: "CLO High Alarm", data: charts.cloHigh, color: "#FF9800", lineType: "dashed" },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số NTU"
                  data={charts.dataNTU}
                  seriesConfig={[
                    { name: "NTU_in", dataIndex: 1, lineType: "solid", color: "#0000FF" },
                    { name: "NTU_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" },
                  ]}
                  visualPieces={charts.visualNTU}
                  alarmSeries={[
                    { name: "NTU High Alarm", data: charts.ntuHigh, color: "#FF9800", lineType: "dashed" },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số áp suất (bar)"
                  data={charts.dataPress}
                  seriesConfig={[{ name: "Áp suất", dataIndex: 1, lineType: "solid", color: "#0000FF" }]}
                  visualPieces={charts.visualPress}
                  alarmSeries={[
                    { name: "Press Low", data: charts.pressLow, color: "#FF9800", lineType: "dashed" },
                    { name: "Press High", data: charts.pressHigh, color: "#FF0000", lineType: "dashed" },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số mực nước (m)"
                  data={charts.dataLevel}
                  seriesConfig={[{ name: "Mực nước", dataIndex: 1, lineType: "solid", color: "#0000FF" }]}
                  visualPieces={charts.visualLevel}
                  alarmSeries={[
                    { name: "Level Low", data: charts.levelLow, color: "#FF9800", lineType: "dashed" },
                    { name: "Level High", data: charts.levelHigh, color: "#FF0000", lineType: "dashed" },
                    { name: "Run Pump", data: charts.runPump, color: "#10B981", lineType: "dashed" },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Chỉ số lưu lượng (m3/h)"
                  data={charts.dataFlow}
                  seriesConfig={[{ name: "Lưu lượng", dataIndex: 1, lineType: "solid", color: "#0000FF" }]}
                  visualPieces={[]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LineGraph
                  title="Tốc độ motor bơm"
                  data={charts.dataSpeed}
                  seriesConfig={[
                    { name: "Bơm 1", dataIndex: 1, color: "#3B82F6" },
                    { name: "Bơm 2", dataIndex: 2, color: "#EF4444" },
                    { name: "Bơm 3", dataIndex: 3, color: "#10B981" },
                  ]}
                  visualPieces={[]}
                  showLinePatternInLegend={false}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;


