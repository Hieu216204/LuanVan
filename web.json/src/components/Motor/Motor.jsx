import { useState } from "react";
import pumpImg from "../../assets/fan.png";
import SpeedChart from "../Piechart";

const Motor = ({ status = 0, speed = 0, name = "Motor", mode = "Manual" }) => {
  const [open, setOpen] = useState(false);

  const getModeLabel = () => {
    if (mode === 0 || mode === "0") return "Manual";
    if (mode === 1 || mode === "1") return "Auto";
    if (typeof mode === "string" && mode.trim() !== "") return mode;
    return "N/A";
  };

  // Màu nền cho box motor
  const getColor = () => {
    switch (status) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Trạng thái + màu chữ
  const getStatus = () => {
    switch (status) {
      case 1:
        return { text: "Đang chạy", color: "text-green-600", icon: "🟢" };
      case 2:
        return { text: "Lỗi", color: "text-red-600", icon: "🔴" };
      default:
        return { text: "Dừng", color: "text-gray-500", icon: "⚫" };
    }
  };

  const statusObj = getStatus();

  return (
    <>
      {/* Box motor */}
      <div
        onClick={() => setOpen(true)}
        className={`relative w-48 h-48 flex flex-col items-center justify-between p-4 rounded-2xl cursor-pointer 
          shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl 
          ${getColor()}`}
      >
        {/* Tên motor */}
        <p className="text-white font-semibold tracking-wide text-xl drop-shadow">
          {name}
        </p>

        {/* Hình ảnh quạt */}
        <img
          src={pumpImg}
          alt="pump"
          className={`w-24 h-35 object-contain drop-shadow-lg -translate-y-2 ${
            status === 1 ? "animate-[spin_2s_linear_infinite]" : ""
          }`}
        />

        {/* Badge trạng thái */}
        <div className="absolute bottom-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-sm shadow-sm">
          <span className={statusObj.color}>{statusObj.text}</span>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          onClick={() => setOpen(false)} // Click ngoài modal để đóng
        >
          <div
            className="bg-white rounded-2xl p-6 w-[420px] max-w-[90%] shadow-2xl relative animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()} // Ngăn click vào modal đóng
          >
            {/* Nút đóng */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors duration-200 text-xl font-bold cursor-pointer"
              aria-label="Đóng"
            >
              ×
            </button>

            {/* Tiêu đề */}
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 border-b pb-2">
              {name}
            </h2>

            {/* Thông tin chi tiết */}
            <div className="space-y-4 mb-6">
              {/* Trạng thái */}
              <div className="flex justify-between items-center p-5 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <span className="text-xl">{statusObj.icon}</span> Trạng thái:
                </span>
                <span className={`text-lg font-semibold ${statusObj.color}`}>
                  {statusObj.text}
                </span>
              </div>

              {/* Tốc độ */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Tốc độ:
                </span>
                <span className="text-lg font-bold text-gray-800">
                  {speed} <span className="text-sm font-normal">(Hz)</span>
                </span>
              </div>

              {/* Chế độ */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <span className="text-xl">🎮</span> Chế độ:
                </span>
                <span className="text-lg font-bold text-gray-800">{getModeLabel()}</span>
              </div>
            </div>

            {/* Biểu đồ tốc độ */}
            <div className="flex justify-center pt-2 border-t border-gray-100">
              <SpeedChart speed={speed} status={status} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Motor;