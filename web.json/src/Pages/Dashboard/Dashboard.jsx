import React, { useState, useEffect, useRef } from "react";
import LineGraph from "../../components/LineGraph";
import { TQT, System, loadAllData } from "./data";

function Dashboard() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      const success = await loadAllData();

      if (success) {
        setRefreshKey(prev => prev + 1);
      }

      if (isFirstLoad.current) {
        setIsInitialLoading(false);
        isFirstLoad.current = false;
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000); // refresh mỗi 30 giây

    return () => clearInterval(interval);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-gray-50">
      <div className="max-w-9xl mx-auto space-y-8">

        {/* ==================== pH CHART ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số pH"
            data={TQT.data_pH}
            seriesConfig={TQT.title_pH}
            visualPieces={TQT.visual_pH}
            alarmSeries={[
              { name: "pH Low Alarm", data: TQT.pH_low, color: "#FF9800", lineType: "dashed" }
            ]}
          />
        </div>

        {/* ==================== CLO CHART ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số CLO"
            data={TQT.data_CLO}
            seriesConfig={TQT.title_CLO}
            visualPieces={TQT.visual_CLO}
            alarmSeries={[
              { name: "CLO High Alarm", data: TQT.CLO_high, color: "#FF9800", lineType: "dashed" }
            ]}
          />
        </div>

        {/* ==================== NTU CHART ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số NTU"
            data={TQT.data_NTU}
            seriesConfig={TQT.title_NTU}
            visualPieces={TQT.visual_NTU}
            alarmSeries={[
              { name: "NTU High Alarm", data: TQT.NTU_high, color: "#FF9800", lineType: "dashed" }
            ]}
          />
        </div>

        {/* ==================== ÁP SUẤT ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số áp suất (bar)"
            data={System.data_Press}
            seriesConfig={System.title_Press}
            visualPieces={System.visual_Press}
            alarmSeries={[
              { name: "Press Low", data: System.Press_low, color: "#FF9800", lineType: "dashed" },
              { name: "Press High", data: System.Press_high, color: "#FF0000", lineType: "dashed" }
            ]}
          />
        </div>

        {/* ==================== MỰC NƯỚC ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số mực nước (m)"
            data={System.data_level}
            seriesConfig={System.title_level}
            visualPieces={System.visual_Level}
            alarmSeries={[
              { name: "Level Low", data: System.Level_low, color: "#FF9800", lineType: "dashed" },
              { name: "Level High", data: System.Level_high, color: "#FF0000", lineType: "dashed" },
              { name: "Run Pump", data: System.Run_motor, color: "#10B981", lineType: "dashed" }
            ]}
          />
        </div>

        {/* ==================== LƯU LƯỢNG ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Chỉ số lưu lượng (m³/h)"
            data={System.data_flow}
            seriesConfig={System.title_flow}
            visualPieces={System.flow}
          />
        </div>

        {/* ==================== TỐC ĐỘ BƠM ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LineGraph
            title="Tốc độ motor bơm"
            data={System.data_speed}
            seriesConfig={System.title_speed}
            visualPieces={[]}
            showLinePatternInLegend={false}
          />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;