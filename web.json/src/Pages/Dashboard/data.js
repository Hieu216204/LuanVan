import axios from "axios";

const BASE_URL = "http://127.0.0.1:8010";

// ================= FORMAT DATE TIME =================
function formatDateTimeForApi(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// ================= CALL API =================
async function getAllDashboard(minutes = 30) {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60 * 1000);

    const a = encodeURIComponent(formatDateTimeForApi(start));
    const b = encodeURIComponent(formatDateTimeForApi(end));

    const [qtdv, qtdr, systemRes, motor, alarms] = await Promise.all([
      axios.get(`${BASE_URL}/api/qtdv/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/qtdr/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/system/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/motor/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/alarms/dashboard?a=${a}&b=${b}`)
    ]);

    return {
      qtdv: qtdv.data.data || [],
      qtdr: qtdr.data.data || [],
      system: systemRes.data.data || [],
      motor: motor.data.data || [],
      alarms: alarms.data.data || []
    };
  } catch (err) {
    console.error("Lỗi gọi API:", err.message);
    return null;
  }
}

// ================= HELPER =================
function mergeData(qtdv, qtdr, field) {
  const allTimes = [...new Set([
    ...qtdv.map(i => i.Date_Time),
    ...qtdr.map(i => i.Date_Time)
  ])].sort();

  return allTimes.map(time => {
    const dv = qtdv.find(i => i.Date_Time === time);
    const dr = qtdr.find(i => i.Date_Time === time);
    return [time, dv ? dv[field] : null, dr ? dr[field] : null];
  });
}

function mapSingle(data, field) {
  return data.map(item => [item.Date_Time, item[field] ?? null]);
}

function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ================= UTILITY: LẤY GIÁ TRỊ ALARM MỚI NHẤT =================
function getLatestAlarmValue(alarmArray) {
  if (!alarmArray || alarmArray.length === 0) return 0;
  // Lấy giá trị alarm của điểm dữ liệu mới nhất
  return Number(alarmArray[alarmArray.length - 1][1]) || 0;
}

// ================= CLASS TQT =================
class TQT {
  static data_pH = [];
  static data_CLO = [];
  static data_NTU = [];

  static title_pH = [
    { name: "PH_in",  dataIndex: 1, lineType: "solid", color: "#0000FF" },
    { name: "PH_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" }
  ];

  static title_CLO = [
    { name: "CLO_in",  dataIndex: 1, lineType: "solid", color: "#0000FF" },
    { name: "CLO_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" }
  ];

  static title_NTU = [
    { name: "NTU_in",  dataIndex: 1, lineType: "solid", color: "#0000FF" },
    { name: "NTU_out", dataIndex: 2, lineType: "dashed", color: "#FF0000" }
  ];

  // Alarm biến thiên (đường alarm)
  static pH_low = [];
  static CLO_high = [];
  static NTU_high = [];

  static title_pH_alarm = [{ name: "pH Low Alarm", dataIndex: 1, lineType: "dashed", color: "#FF0000" }];
  static title_CLO_alarm = [{ name: "CLO High Alarm", dataIndex: 1, lineType: "dashed", color: "#FF0000" }];
  static title_NTU_alarm = [{ name: "NTU High Alarm", dataIndex: 1, lineType: "dashed", color: "#FF0000" }];

  // VisualPieces sẽ được tạo động trong loadAllData
  static visual_pH = [];
  static visual_CLO = [];
  static visual_NTU = [];
}

// ================= CLASS System =================
class System {
  static data_Press = [];
  static data_level = [];
  static data_flow = [];
  static data_speed = [];

  static title_Press = [{ name: "Áp suất", dataIndex: 1, lineType: "solid", color: "#0000FF" }];
  static title_level = [{ name: "Mực nước", dataIndex: 1, lineType: "solid", color: "#0000FF"}];
  static title_flow = [{ name: "Lưu lượng", dataIndex: 1, lineType: "solid", color: "#0000FF" }];
  static title_speed = [
    { name: "Bơm 1", dataIndex: 1, color: "#3B82F6" },
    { name: "Bơm 2", dataIndex: 2, color: "#EF4444" },
    { name: "Bơm 3", dataIndex: 3, color: "#10B981" }
  ];

  static Press_low = [];
  static Press_high = [];
  static Level_low = [];
  static Level_high = [];
  static Run_motor = [];

  static title_Press_low_alarm = [{ name: "Áp suất thấp", dataIndex: 1, lineType: "dashed", color: "#FF0000" }];
  static title_Press_high_alarm = [{ name: "Áp suất cao", dataIndex: 1, lineType: "dashed", color: "#FF0000" }];

  // VisualPieces động
  static visual_Press = [];
  static visual_Level = [];
}

// ================= LOAD ALL DATA =================
async function loadAllData() {
  const data = await getAllDashboard(30);
  if (!data) {
    console.error("Không lấy được dữ liệu từ API");
    return false;
  }

  // Dữ liệu đo
  TQT.data_pH = mergeData(data.qtdv, data.qtdr, "pH");
  TQT.data_CLO = mergeData(data.qtdv, data.qtdr, "CLO");
  TQT.data_NTU = mergeData(data.qtdv, data.qtdr, "NTU");

  System.data_Press = mapSingle(data.system, "Pressure");
  System.data_level = mapSingle(data.system, "Level");
  System.data_flow = mapSingle(data.system, "FlowRate");

  System.data_speed = data.motor.map(item => [
    item.Date_Time,
    item.Motor1 ?? 0,
    item.Motor2 ?? 0,
    item.Motor3 ?? 0
  ]);

  // Alarm biến thiên
  TQT.pH_low   = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.pH_low_set)]);
  TQT.CLO_high = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.CLO_high_set)]);
  TQT.NTU_high = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.NTU_high_set)]);

  System.Press_low  = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.Press_low)]);
  System.Press_high = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.Press_high)]);
  System.Level_low  = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.Level_low)]);
  System.Level_high = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.Level_high)]);
  System.Run_motor  = data.alarms.map(item => [item.Date_Time, toFiniteNumber(item.Run_pump ?? item.Run_pump_alarm)]);

  // ================= TẠO VISUAL PIECES ĐỘNG =================
  const pH_low_val   = getLatestAlarmValue(TQT.pH_low);
  const CLO_high_val = getLatestAlarmValue(TQT.CLO_high);
  const NTU_high_val = getLatestAlarmValue(TQT.NTU_high);
  const Press_low_val  = getLatestAlarmValue(System.Press_low);
  const Press_high_val = getLatestAlarmValue(System.Press_high);
  const Level_low_val  = getLatestAlarmValue(System.Level_low);
  const Level_high_val = getLatestAlarmValue(System.Level_high);
  const pressDataMax = Math.max(
    ...System.data_Press.map(([, v]) => toFiniteNumber(v, 0)),
    Press_high_val,
    Press_low_val,
    0
  );
  const levelDataMax = Math.max(
    ...System.data_level.map(([, v]) => toFiniteNumber(v, 0)),
    Level_high_val,
    Level_low_val,
    0
  );

  TQT.visual_pH = [
    { gt: 0,  lte: pH_low_val, color: "#FF0000" },
    { gt: pH_low_val, lte: 14, color: "#0000FF" }
  ];

  TQT.visual_CLO = [
    { gt: 0,  lte: CLO_high_val, color: "#0000FF" },
    { gt: CLO_high_val, lte: 5,  color: "#FF0000" }
  ];

  TQT.visual_NTU = [
    { gt: 0,  lte: NTU_high_val, color: "#0000FF" },
    { gt: NTU_high_val, lte: 5,  color: "#FF0000" }
  ];

  System.visual_Press = [
    { gt: 0, lte: Press_low_val, color: "#FF0000" },
    { gt: Press_low_val, lte: Press_high_val, color: "#0000FF" },
    { gt: Press_high_val, lte: pressDataMax + 5, color: "#FF0000" }
  ];

  System.visual_Level = [
    { gt: 0, lte: Level_low_val, color: "#FF0000" },
    { gt: Level_low_val, lte: Level_high_val, color: "#0000FF" },
    { gt: Level_high_val, lte: levelDataMax + 5, color: "#FF0000" }
  ];

  console.log(` pH_low=${pH_low_val} | CLO_high=${CLO_high_val} | Press_low=${Press_low_val}`);
  return true;
}

export { TQT, System, loadAllData };