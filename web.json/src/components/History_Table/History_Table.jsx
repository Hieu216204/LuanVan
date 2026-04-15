import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import styles from "./template";
import exportToPDF from "./export_report";

// ====================== CONFIG ======================

const SECTION_CONFIG = {
  input: {
    label: "Trạm Đầu Vào",
    cols: ["Thời Gian", "pH", "CLO", "NTU"],
    keys: ["Date_Time", "pH", "CLO", "NTU"],
  },
  output: {
    label: "Trạm Đầu Ra",
    cols: ["Thời Gian", "pH", "CLO", "NTU"],
    keys: ["Date_Time", "pH", "CLO", "NTU"],
  },
  pump: {
    label: "Hệ Thống Bơm",
    cols: ["Thời Gian", "Mức", "Áp Suất", "Lưu Lượng", "Tổng Ngày"],
    keys: ["Date_Time", "Level", "Pressure", "FlowRate", "TotalDay"],
  },
  event: {
    label: "Sự Kiện",
    cols: ["Thời Gian", "Nội Dung"],
    keys: ["Date_Time", "Event_System"],
  },
};

const ICONS = {
  input: "⬇",
  output: "⬆",
  pump: "⚙",
  event: "⚡",
};

// ====================== DATE TIME PICKER ======================

const DateTimePicker = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ date: "", time: "" });
  const ref = useRef(null);

  const split = (v) => {
    if (!v) return { date: "", time: "" };
    const [d, t] = v.split("T");
    return { date: d || "", time: t ? t.slice(0, 5) : "" };
  };

  const openPicker = () => {
    setDraft(split(value));
    setOpen(true);
  };

  const apply = () => {
    onChange(draft.date ? `${draft.date}T${draft.time || "00:00"}` : "");
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const display = value
    ? (() => {
        const d = new Date(value);
        return isNaN(d) ? value : d.toLocaleString("vi-VN", { hour12: false });
      })()
    : null;

  return (
    <div className="ht-dt-wrap" ref={ref}>
      <label className="ht-filter-label">{label}</label>
      <div
        className={`ht-dt-display ${open ? "open" : ""} ${value ? "filled" : ""}`}
        onClick={openPicker}
      >
        <span className="ht-dt-icon">📅</span>
        <span className={`ht-dt-text ${!display ? "ph" : ""}`}>
          {display || "Chọn ngày & giờ..."}
        </span>
        {value && (
          <span className="ht-dt-clear" onClick={clear} title="Xoá">
            ✕
          </span>
        )}
      </div>

      {open && (
        <div className="ht-dt-popup">
          <div className="ht-dt-popup-title">Chọn Khoảng Thời Gian</div>
          <div className="ht-dt-fields">
            <div className="ht-dt-field">
              <label>Ngày</label>
              <input
                className="ht-dt-native"
                type="date"
                value={draft.date}
                onChange={(e) => {
                  const next = { ...draft, date: e.target.value };
                  setDraft(next);
                  onChange(next.date ? `${next.date}T${next.time || "00:00"}` : "");
                }}
              />
            </div>
            <div className="ht-dt-field">
              <label>Giờ</label>
              <input
                className="ht-dt-native"
                type="time"
                value={draft.time}
                onChange={(e) => {
                  const next = { ...draft, time: e.target.value };
                  setDraft(next);
                  onChange(next.date ? `${next.date}T${next.time || "00:00"}` : "");
                }}
              />
            </div>
          </div>
          <div className="ht-dt-actions">
            <button className="ht-dt-btn cancel" onClick={() => setOpen(false)}>
              Huỷ
            </button>
            <button className="ht-dt-btn apply" onClick={apply}>
              ✓ Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ====================== MAIN COMPONENT ======================

const History_Table = ({ data, onQuery }) => {
  const [queryError, setQueryError] = useState("");
  const [hasQueried, setHasQueried] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedTypes, setSelected] = useState({
    input: true,
    output: true,
    pump: true,
    event: true,
  });
  // State tạm để lưu giá trị từ picker, chưa áp dụng lọc
  const [tempFromTime, setTempFromTime] = useState("");
  const [tempToTime, setTempToTime] = useState("");
  // State thực tế dùng để lọc, chỉ thay đổi khi nhấn "Truy xuất"
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // Ref cho nội dung in
  const printRef = useRef(null);

  // ====================== HELPERS ======================

  const formatTime = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleString("vi-VN", { hour12: false });
  };

  const formatVal = (val) => {
    if (val === null || val === undefined || val === "") {
      return <span style={{ color: "var(--text-muted)" }}>—</span>;
    }
    return <span className="ht-val">{val}</span>;
  };

  // ====================== IN TRỰC TIẾP ======================
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Bao_cao_he_thong",
    // Có thể thêm các tuỳ chọn khác như onBeforePrint, onAfterPrint
  });

  // ====================== TRUY XUẤT ======================
  const handleQuery = async () => {
    setQueryError("");

    // 1. Check chọn nguồn dữ liệu
    const hasAnyTypeSelected = Object.values(selectedTypes).some(v => v);
    if (!hasAnyTypeSelected) {
      setQueryError("🚨 Vui lòng chọn ít nhất một nguồn dữ liệu.");
      return;
    }

    // 2. Check thời gian hợp lệ
    const fromValid = tempFromTime ? !isNaN(new Date(tempFromTime).getTime()) : true;
    const toValid = tempToTime ? !isNaN(new Date(tempToTime).getTime()) : true;

    if (!fromValid || !toValid) {
      setQueryError("🚨 Ngày giờ không hợp lệ.");
      return;
    }

    // 3. Check logic thời gian
    if (tempFromTime && tempToTime) {
      const fromDate = new Date(tempFromTime);
      const toDate = new Date(tempToTime);

      if (fromDate > toDate) {
        setQueryError("🚨 Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.");
        return;
      }
    }

    // 4. OK -> áp dụng filter
    setFromTime(tempFromTime);
    setToTime(tempToTime);
    setHasQueried(true);

    if (typeof onQuery === "function") {
      await onQuery(tempFromTime, tempToTime);
    }
  };

  // ====================== ACTIVE TYPES ======================

  const activeTypes = Object.keys(selectedTypes).filter((k) => selectedTypes[k]);

  // ====================== EFFECTS ======================

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Lọc dữ liệu khi fromTime, toTime hoặc selectedTypes thay đổi
  useEffect(() => {
    if (!data) return;

    const filterByTime = (arr) =>
      arr.filter((item) => {
        if (!item.Date_Time) return false;
        const t = new Date(item.Date_Time).getTime();
        const from = fromTime ? new Date(fromTime).getTime() : null;
        const to = toTime ? new Date(toTime).getTime() : null;
        if (from && t < from) return false;
        if (to && t > to) return false;
        return true;
      });

    const sections = {};
    for (const k of Object.keys(SECTION_CONFIG)) {
      sections[k] = selectedTypes[k] ? filterByTime(data[k] || []) : [];
    }

    const length = Math.max(...Object.values(sections).map((a) => a.length), 0);
    const temp = [];

    for (let i = 0; i < length; i++) {
      const row = {};
      for (const k of Object.keys(sections)) {
        row[k] = sections[k][i] || {};
      }
      temp.push(row);
    }

    setRows(temp);
  }, [data, selectedTypes, fromTime, toTime]);

  // ====================== TOGGLE ======================

  const toggleType = (type) =>
    setSelected((p) => ({ ...p, [type]: !p[type] }));

  const now = new Date().toLocaleString("vi-VN", { hour12: false });
  const totalCols = 1 + activeTypes.reduce(
    (s, t) => s + SECTION_CONFIG[t].cols.length,
    0
  );

  // ====================== RENDER ======================

  return (
    <div className="ht-root">
      {/* Controls - Filters */}
      <div className="ht-controls">
        <DateTimePicker
          label="Từ thời điểm"
          value={tempFromTime}
          onChange={setTempFromTime}
        />
        <DateTimePicker
          label="Đến thời điểm"
          value={tempToTime}
          onChange={setTempToTime}
        />

        <button
          className="ht-query-btn"
          onClick={handleQuery}
          style={{
            marginLeft: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Truy xuất
        </button>

        <div className="ht-divider" />

        <div>
          <label className="ht-filter-label">Nguồn dữ liệu</label>
          <div className="ht-toggles">
            {Object.keys(SECTION_CONFIG).map((type) => (
              <button
                key={type}
                className={`ht-toggle ${type} ${selectedTypes[type] ? "active" : ""}`}
                onClick={() => toggleType(type)}
              >
                <span className="ht-toggle-dot" />
                {ICONS[type]} {SECTION_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>

        <div className="ht-divider" />

        <div className="ht-export-group">
          <label className="ht-filter-label">Xuất báo cáo</label>
          <div className="ht-export-buttons">
            <button className="ht-export-btn pdf" onClick={() => exportToPDF(rows, printRef)}>
              📄 Xuất PDF
            </button>
            <button className="ht-export-btn print" onClick={handlePrint}>
              🖨 In
            </button>
          </div>
        </div>

        {queryError && (
          <div
            style={{
              color: "#e53935",
              marginTop: "8px",
              fontWeight: "bold",
            }}
          >
            {queryError}
          </div>
        )}
      </div>

      {/* Nội dung cần in (không bao gồm các nút điều khiển) */}
      <div ref={printRef} className="ht-print-area">
        <div className="ht-table-wrap">
          <table className="ht-table">
            <thead>
              <tr>
                <th
                  className="ht-th-group stt"
                  rowSpan="2"
                  style={{ position: "sticky", left: 0, zIndex: 11 }}
                >
                  #
                </th>
                {activeTypes.map((type) => (
                  <th
                    key={type}
                    className={`ht-th-group ${type}`}
                    colSpan={SECTION_CONFIG[type].cols.length}
                  >
                    {ICONS[type]} {SECTION_CONFIG[type].label}
                  </th>
                ))}
              </tr>
              <tr>
                {activeTypes.map((type) =>
                  SECTION_CONFIG[type].cols.map((col, ci) => (
                    <th
                      key={`${type}-${ci}`}
                      className={`ht-th-sub ${ci === 0 ? type : ""}`}
                    >
                      {col}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {!hasQueried ? (
                <tr>
                  <td colSpan={totalCols} className="ht-empty">
                    Vui lòng chọn điều kiện và nhấn "Truy xuất".
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="ht-empty">
                    Không có dữ liệu trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td className="ht-td stt">{i + 1}</td>
                    {activeTypes.map((type) =>
                      SECTION_CONFIG[type].keys.map((key, ki) => (
                        <td
                          key={`${type}-${ki}`}
                          className={`ht-td ${type} ${ki === 0 ? "time" : ""}`}
                        >
                          {ki === 0
                            ? formatTime(row[type][key])
                            : formatVal(row[type][key])}
                        </td>
                      ))
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ht-footer">
          <span className="ht-footer-text">Cập nhật lúc: {now}</span>
        </div>
      </div>

      
    </div>
  );
};

export default History_Table;