import axios from "axios";

const BASE_URL = "http://127.0.0.1:8010";

function formatDateTimeForApi(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function getHistoryByRange(fromTime, toTime) {
  try {
    const end = toTime ? new Date(toTime) : new Date();
    const start = fromTime
      ? new Date(fromTime)
      : new Date(end.getTime() - 30 * 60 * 1000);

    const a = encodeURIComponent(formatDateTimeForApi(start));
    const b = encodeURIComponent(formatDateTimeForApi(end));

    const [qtdv, qtdr, systemRes, event, motor, alarms] = await Promise.all([
      axios.get(`${BASE_URL}/api/qtdv/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/qtdr/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/system/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/event/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/motor/dashboard?a=${a}&b=${b}`),
      axios.get(`${BASE_URL}/api/alarms/dashboard?a=${a}&b=${b}`),
    ]);

    return {
      input: qtdv.data.data || [],
      output: qtdr.data.data || [],
      pump: systemRes.data.data || [],
      event: event.data.data || [],
      motor: motor.data.data || [],
      alarms: alarms.data.data || [],
    };
  } catch (err) {
    console.error("Lỗi gọi API lịch sử:", err.message);
    return {
      input: [],
      output: [],
      pump: [],
      event: [],
      motor: [],
      alarms: [],
    };
  }
}

export { getHistoryByRange };
