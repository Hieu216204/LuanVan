import React, { useState, useEffect, useRef } from "react";
import Motor from "../../components/Motor";
import Valves from "../../components/Valves";
import pic1 from "../../assets/water-pump.png";
import pic2 from "../../assets/valve.png";
import { Status_Device,Mode_Device, loadAllData } from "./data";

function Status() {
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

    const interval = setInterval(fetchData, 5000); // refresh mỗi 30 giây

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
    <div className="flex flex-row h-full ">
      <div>
     <div className="w-75 h-full flex flex-col justify-around  overflow-y-auto gap-1 p-3 items-center bg-gray-200">
      <div className="w-full h-5 flex items-center justify-center text-2xl font-bold">
        Trạng thái máy bơm
      </div>
      <Motor status={Status_Device.status_pump_1[0]?.[1] || 0} speed={Status_Device.speed_pump_1[0]?.[1] || 0} name="Bơm 1" mode={Mode_Device.mode_pump_1[0]?.[1] ?? "N/A"} />
      <Motor status={Status_Device.status_pump_2[0]?.[1] || 0} speed={Status_Device.speed_pump_2[0]?.[1] || 0} name="Bơm 2" mode={Mode_Device.mode_pump_2[0]?.[1] ?? "N/A"} />
      <Motor status={Status_Device.status_pump_3[0]?.[1] || 0} speed={Status_Device.speed_pump_3[0]?.[1] || 0} name="Bơm 3" mode={Mode_Device.mode_pump_3[0]?.[1] ?? "N/A"} />
    </div>
    </div>
    <div className="flex flex-row w-full h-full">
      <div className="basis-1/200"></div>
      <div  className="flex flex-col  basis-199/200  bg-gray-200 ">
      <div className="w-full h-5 flex items-center justify-center text-2xl font-bold m-10">
            <img src={pic2} alt="Valve" className="w-8 h-8 mr-2" />
           <div >Trạng thái các van</div>
      </div>



      <div className="flex flex-wrap">
        <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_1[0]?.[1] || 0} name="Van 1" mode={Mode_Device.mode_valve_1[0]?.[1] ?? "N/A"} /></div>
        <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_2[0]?.[1] || 0} name="Van 2" mode={Mode_Device.mode_valve_2[0]?.[1] ?? "N/A"} /></div>
        <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_3[0]?.[1] || 0} name="Van 3" mode={Mode_Device.mode_valve_3[0]?.[1] ?? "N/A"} /></div>
        <div className="mt-20 flex flex-wrap w-full">
          <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_4[0]?.[1] || 0} name="Van 4" mode={Mode_Device.mode_valve_4[0]?.[1] ?? "N/A"} /></div>
          <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_5[0]?.[1] || 0} name="Van 5" mode={Mode_Device.mode_valve_5[0]?.[1] ?? "N/A"} /></div>
          <div className="basis-1/3 flex justify-center"><Valves status={Status_Device.status_valve_6[0]?.[1] || 0} name="Van 6" mode={Mode_Device.mode_valve_6[0]?.[1] ?? "N/A"} /></div>
        </div>
        <div className="basis-full flex justify-center mt-20">
          <Valves status={Status_Device.status_valve_7[0]?.[1] || 0} name="Van 7" mode={Mode_Device.mode_valve_7[0]?.[1] ?? "N/A"} />
        </div>
      </div>

      </div>
    </div>
    </div>
  );
}

export default Status;