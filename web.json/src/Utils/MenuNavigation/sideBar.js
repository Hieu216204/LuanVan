import { paths } from "../../Config"
import { CiHome } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6"
import { FaRegUserCircle } from "react-icons/fa"
import { MdRadioButtonChecked } from "react-icons/md"
import { MdOutlineSettings } from "react-icons/md"
import { MdOutlineLogin } from "react-icons/md"
import { GrSystem } from "react-icons/gr";
import { GoHistory } from "react-icons/go";


const SIDE_BAR_ITEMS = [
    {
        label: "TRANG CHỦ",
        route: paths.dashboard,
        link: "/dashboard",
        icon: CiHome ,
    },
    {
        label: "TRẠNG THÁI",
        route: paths.status,
        link: "/status",
        icon: GrSystem,
    },
    {
        label: "LỊCH SỬ",
        route: paths.history,
        link: "/history",
        icon: GoHistory,
    },
]

export { SIDE_BAR_ITEMS }