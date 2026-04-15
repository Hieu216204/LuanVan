import { useState, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import cl from "classnames"
import SidebarItem from "./SideBarItem"
import logo from "../../../assets/HCMUT_official_logo.png"
import { SIDE_BAR_ITEMS } from "../../../Utils/MenuNavigation"

function Sidebar({ id }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [currentPath, setCurrentPath] = useState(location.pathname)
    console.log("Current Path:", currentPath)

    const handleClick = (route) => {
        if (!route) return
        navigate(route)
        setCurrentPath(route)
    }

    return (
        <div
            data-component="Sidebar"
            className={cl(
                "relative w-full h-full bg-[linear-gradient(240deg,#00AEEF_20%,#0072FF_55%,#0052CC_80%,#003A8C_95%)] flex flex-col justify-start items-center ",
                "scroll-y h-full",
            )}
        >
            <div
                className="mx-auto w-full h-[25%] cursor-pointer flex justify-center items-center"
                onClick={() => handleClick("/dashboard")}
            >
               <img
                className="rounded-2xl shadow-lg shadow-black/30 w-[80%] bg-white p-2"
                src={logo}
                alt=""
                />
            </div>
            <div className={cl("sticky flex flex-col justify-start items-center h-[70%] w-full")}>
                {SIDE_BAR_ITEMS.map((item, index) => (
                    <SidebarItem
                        key={index}
                        Icon={item.icon}
                        label={item.label}
                        actived={currentPath.includes(item.route)}
                        onClick={() => handleClick(item.link ? item.link : null)}
                        // listItem={item.listItem}
                    />
                ))}
            </div>
        </div>
    )
}

export default Sidebar