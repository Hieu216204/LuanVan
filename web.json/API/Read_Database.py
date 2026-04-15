from mysql.connector import pooling
from datetime import datetime
from datetime import timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# KẾT NỐI DATABASE
db_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    host="localhost",
    user="root",
    password="216204",
    database="mydatabase"
)

def connect_db():
    try:
        return db_pool.get_connection()
    except Exception as e:
        print("Lỗi DB:", e)
        return None

def read_chart_data(table, fields, start_time: datetime, end_time: datetime):
    """
    table: "data_qtdv" hoặc "data_qtdr"
    fields: ["pH", "CLO", "NTU"]
    start_time: thời gian bắt đầu
    end_time: thời gian kết thúc
    """

    conn = connect_db()
    if conn is None:
        return []

    try:
        cursor = conn.cursor()

        # ===== build AVG fields =====
        agg_fields = ", ".join([f"AVG({f}) AS {f}" for f in fields])

        # ===== query =====
        query = f"""
            SELECT 
                DATE_FORMAT(Date_Time, '%Y-%m-%d %H:%i') as time,
                {agg_fields}
            FROM {table}
            WHERE Date_Time BETWEEN %s AND %s
            GROUP BY DATE_FORMAT(Date_Time, '%Y-%m-%d %H:%i')
            ORDER BY time ASC
        """

        cursor.execute(query, (start_time, end_time))
        rows = cursor.fetchall()

        result = []

        for row in rows:
            time_str = row[0]

            data = {
                "Date_Time": time_str
            }

            valid = False

            # ===== map field =====
            for i, field in enumerate(fields):
                val = row[i + 1]

                # convert + làm tròn
                v = round(float(val), 2) if val is not None else None

                # check dữ liệu hợp lệ (khác 0)
                if v is not None and v != 0:
                    valid = True

                data[field] = v

            # ===== bỏ dòng toàn 0 =====
            if not valid:
                continue

            result.append(data)

        return result

    except Exception as e:
        print("Lỗi DB:", e)
        return []

    finally:
        conn.close()


def get_latest_chart_data(table, fields, start_time: datetime, end_time: datetime):
    """
    Dùng read_chart_data để lấy bản ghi mới nhất trong khoảng thời gian.
    """
    rows = read_chart_data(table, fields, start_time, end_time)
    if not rows:
        return {}
    return rows[-1]


def read_latest_raw_data(table, fields, start_time: datetime, end_time: datetime):
    """
    Lấy bản ghi mới nhất (raw) trong khoảng thời gian, KHÔNG AVG/GROUP BY.
    Hữu ích cho dữ liệu trạng thái ON/OFF (0/1).
    """
    conn = connect_db()
    if conn is None:
        return {}

    try:
        cursor = conn.cursor()
        select_fields = ", ".join(fields)
        query = f"""
            SELECT
                DATE_FORMAT(Date_Time, '%Y-%m-%d %H:%i') as time,
                {select_fields}
            FROM {table}
            WHERE Date_Time BETWEEN %s AND %s
            ORDER BY Date_Time DESC
            LIMIT 1
        """
        cursor.execute(query, (start_time, end_time))
        row = cursor.fetchone()

        if not row:
            return {}

        result = {"Date_Time": row[0]}
        for i, field in enumerate(fields):
            val = row[i + 1]
            # Dữ liệu status là 0/1 -> trả về int để tránh số thập phân
            result[field] = int(round(float(val))) if val is not None else 0

        return result

    except Exception as e:
        print("Lỗi DB:", e)
        return {}

    finally:
        conn.close()


def read_event_data(start_time: datetime, end_time: datetime):
    """
    Đọc log sự kiện dạng raw theo khoảng thời gian, giữ nguyên nội dung text Event_System.
    """
    conn = connect_db()
    if conn is None:
        return []

    try:
        cursor = conn.cursor()
        query = """
            SELECT
                DATE_FORMAT(Date_Time, '%Y-%m-%d %H:%i:%S') as time,
                Event_System
            FROM event_system
            WHERE Date_Time BETWEEN %s AND %s
            ORDER BY Date_Time ASC
        """

        cursor.execute(query, (start_time, end_time))
        rows = cursor.fetchall()

        return [
            {
                "Date_Time": row[0],
                "Event_System": row[1] if row[1] is not None else "",
            }
            for row in rows
        ]

    except Exception as e:
        print("Lỗi DB:", e)
        return []

    finally:
        conn.close()
        
        
@app.get("/api/qtdv/dashboard")
def get_qtdv_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_chart_data("data_qtdv", ["pH", "CLO", "NTU"], a, b)
    return {"data": data}

@app.get("/api/qtdr/dashboard")
def get_qtdr_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_chart_data("data_qtdr", ["pH", "CLO", "NTU"], a, b)
    return {"data": data}

@app.get("/api/system/dashboard")
def get_system_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_chart_data(
        "data_trambom",
        ["Pressure", "Level", "FlowRate","TotalDay"],
        a,
        b
    )
    return {"data": data}

@app.get("/api/event/dashboard")
def get_event_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_event_data(a, b)
    return {"data": data}

@app.get("/api/motor/dashboard")
def get_motor_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_chart_data(
        "data_motor",
        ["Motor1", "Motor2", "Motor3"],
        a,
        b
    )
    return {"data": data}
 
@app.get("/api/alarms/dashboard")
def get_alarms_dashboard(a: datetime, b: datetime):
    if a > b:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": []}
    data = read_chart_data(
        "data_alarm",
        ["pH_low_set", "CLO_high_set", "NTU_high_set", "Level_low", "Level_high", "Run_pump", "Press_low", "Press_high"],
        a,
        b
    )
    return {"data": data}

@app.get("/api/status/status")
def get_status_status(a: datetime = None, b: datetime = None):
    end_time = b or datetime.now()
    start_time = a or (end_time - timedelta(minutes=30))

    if start_time > end_time:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": {}}

    data = read_latest_raw_data(
        "data_status",
        ["Start_Pump_1", "Start_Pump_2", "Start_Pump_3", "Valve_1", "Valve_2", "Valve_3", "Valve_4", "Valve_5", "Valve_6", "Valve_7"],
        start_time,
        end_time,
    )

    return {"data": data or {}}

@app.get("/api/speed/status")
def get_status_speed(a: datetime = None, b: datetime = None):
    end_time = b or datetime.now()
    start_time = a or (end_time - timedelta(minutes=30))

    if start_time > end_time:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": {}}

    data = read_latest_raw_data(
        "data_motor",
        ["Motor1", "Motor2", "Motor3"],
        start_time, end_time,
    )
    return {"data": data}  

@app.get("/api/mode/status")
def get_status_mode(a: datetime = None, b: datetime = None):
    end_time = b or datetime.now()
    start_time = a or (end_time - timedelta(minutes=30))
    
    if start_time > end_time:
        return {"error": "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc", "data": {}}
    
    data = read_latest_raw_data(
        "data_mode",
        ["Mode_Pump_1", "Mode_Pump_2", "Mode_Pump_3", "Mode_Val_1", "Mode_Val_2", "Mode_Val_3", "Mode_Val_4", "Mode_Val_5", "Mode_Val_6", "Mode_Val_7"],
        start_time,
        end_time
    )
    return {"data": data}


if __name__ == "__main__": 

    uvicorn.run("Read_Database:app", host="0.0.0.0", port=8010, reload=True)