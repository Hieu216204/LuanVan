import * as Pages from "../Pages"
import { paths } from "../Config"

const routes = [
    {
        path: paths.dashboard,
        Title: "GIÁ TRỊ THÔNG SỐ HIỆN TẠI",
        Component: Pages.Dashboard,
        mainLayout: true,
        protected: true,
    },

    {
        path: paths.status,
        Title: "TRẠNG THÁI IO HIÊN TẠI",
        Component: Pages.Status,
        mainLayout: true,
        protected: true,
    },

    {
        path: paths.history,
        Title: "TRUY XUẤT DỮ LIỆU LỊCH SỬ",
        Component: Pages.History,
        mainLayout: true,
        protected: true,
    },
]
export default routes