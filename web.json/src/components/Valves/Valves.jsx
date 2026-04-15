import { useState } from "react";
import { FaTint, FaExclamationTriangle, FaLock, FaCog } from "react-icons/fa";

const Valves = ({ status = 0, name = "Valve", mode = "Manual" }) => {
  const [open, setOpen] = useState(false);

  const getModeLabel = () => {
    if (mode === 0 || mode === "0") return "Manual";
    if (mode === 1 || mode === "1") return "Auto";
    if (typeof mode === "string" && mode.trim() !== "") return mode;
    return "N/A";
  };

  const getColor = () => {
    switch (status) {
      case 1: return "bg-green-500";
      case 2: return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getStatus = () => {
    switch (status) {
      case 1: return { text: "MỞ", color: "text-green-600", icon: FaTint };
      case 2: return { text: "LỖI", color: "text-red-600", icon: FaExclamationTriangle };
      default: return { text: "ĐÓNG", color: "text-gray-600", icon: FaLock };
    }
  };

  const statusObj = getStatus();
  const StatusIcon = statusObj.icon;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`relative w-48 h-48 flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer 
          shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 ${getColor()}`}
      >
        <p className="text-white font-semibold tracking-wide text-xl mb-2 drop-shadow">
          {name}
        </p>
        <div className="text-white  mb-6 ">
          <StatusIcon className="drop-shadow text-7xl m-3" />
        </div>
        <div className="absolute bottom-2 px-6 py-1 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-sm shadow-sm">
          <span className={statusObj.color}>{statusObj.text}</span>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[420px] max-w-[90%] shadow-2xl relative transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors duration-200 text-xl font-bold cursor-pointer"
              aria-label="Đóng"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 border-b pb-2">
              {name}
            </h2>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <StatusIcon className="text-gray-500" /> Trạng thái:
                </span>
                <span className={`text-lg font-semibold ${statusObj.color}`}>
                  {statusObj.text}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <FaCog className="text-gray-500" /> Chế độ:
                </span>
                <span className="text-lg font-bold text-blue-600">{getModeLabel()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Valves;