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

    const [motor, mode, status] = await Promise.all([
      axios.get(`${BASE_URL}/api/speed/status?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/mode/status?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/status/status?a=${a}&b=${b}`)
    ]);

    return {
      motor: motor.data.data || {},
      mode: mode.data.data || {},
      status: status.data.data || {}
    };
  } catch (err) {
    console.error("Lỗi gọi API:", err.message);
    return null;
  }
}

function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getLatestSnapshot(payload) {
  if (!payload) return {};
  if (Array.isArray(payload)) {
    if (!payload.length) return {};
    return payload[payload.length - 1] || {};
  }
  return payload;
}


// ================= status =================
class Status_Device {
    static status_pump_1 = [];
    static status_pump_2 = [];
    static status_pump_3 = [];
    static status_valve_1 = [];
    static status_valve_2 = [];
    static status_valve_3 = [];
    static status_valve_4 = [];
    static status_valve_5 = [];
    static status_valve_6 = [];
    static status_valve_7 = [];
    static speed_pump_1 = [];
    static speed_pump_2 = [];
    static speed_pump_3 = [];
}

class Mode_Device {
    static mode_pump_1 = [];
    static mode_pump_2 = [];
    static mode_pump_3 = [];
    static mode_valve_1 = [];
    static mode_valve_2 = [];
    static mode_valve_3 = [];
    static mode_valve_4 = [];
    static mode_valve_5 = [];
    static mode_valve_6 = [];
    static mode_valve_7 = [];
}

// ================= LOAD ALL DATA =================
async function loadAllData() {
  const data = await getAllDashboard(30);
  if (!data) {
    console.error("Không lấy được dữ liệu từ API");
    return false;
  }

  const status = getLatestSnapshot(data.status);
  const motor = getLatestSnapshot(data.motor);
  const mode = getLatestSnapshot(data.mode);
  const time = status.Date_Time || motor.Date_Time || null;

  Status_Device.status_pump_1 = [[time, toFiniteNumber(status.Start_Pump_1 )]];
  Status_Device.status_pump_2 = [[time, toFiniteNumber(status.Start_Pump_2 )]];
  Status_Device.status_pump_3 = [[time, toFiniteNumber(status.Start_Pump_3 )]];
  Status_Device.status_valve_1 = [[time, toFiniteNumber(status.Valve_1)]];
  Status_Device.status_valve_2 = [[time, toFiniteNumber(status.Valve_2)]];
  Status_Device.status_valve_3 = [[time, toFiniteNumber(status.Valve_3)]];
  Status_Device.status_valve_4 = [[time, toFiniteNumber(status.Valve_4)]];
  Status_Device.status_valve_5 = [[time, toFiniteNumber(status.Valve_5)]];
  Status_Device.status_valve_6 = [[time, toFiniteNumber(status.Valve_6)]];
  Status_Device.status_valve_7 = [[time, toFiniteNumber(status.Valve_7)]];
  Status_Device.speed_pump_1 = [[time, toFiniteNumber(motor.Motor1)]];
  Status_Device.speed_pump_2 = [[time, toFiniteNumber(motor.Motor2 )]];
  Status_Device.speed_pump_3 = [[time, toFiniteNumber(motor.Motor3 )]];
  Mode_Device.mode_pump_1 = [[time, toFiniteNumber(mode.Mode_Pump_1)]];
  Mode_Device.mode_pump_2 = [[time, toFiniteNumber(mode.Mode_Pump_2)]];
  Mode_Device.mode_pump_3 = [[time, toFiniteNumber(mode.Mode_Pump_3)]];
  Mode_Device.mode_valve_1 = [[time, toFiniteNumber(mode.Mode_Val_1)]];
  Mode_Device.mode_valve_2 = [[time, toFiniteNumber(mode.Mode_Val_2)]];
  Mode_Device.mode_valve_3 = [[time, toFiniteNumber(mode.Mode_Val_3)]];
  Mode_Device.mode_valve_4 = [[time, toFiniteNumber(mode.Mode_Val_4)]];
  Mode_Device.mode_valve_5 = [[time, toFiniteNumber(mode.Mode_Val_5)]];
  Mode_Device.mode_valve_6 = [[time, toFiniteNumber(mode.Mode_Val_6)]];
  Mode_Device.mode_valve_7 = [[time, toFiniteNumber(mode.Mode_Val_7)]];
  return true;
}




export { Status_Device, Mode_Device, loadAllData };