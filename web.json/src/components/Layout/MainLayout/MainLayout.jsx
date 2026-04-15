import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import Sidebar from "../Sidebar"

function MainLayout({ children, title }) {
    const navigate = useNavigate()
    const param = useLocation().pathname.split("/")
    // console.log("direction", direction)
    return (
        <div data-component="MainLayout" className="flex h-screen w-screen relative overflow-hidden">
            <aside className="h-full w-[14%] min-w-55 shrink-0">
                <Sidebar id={param} />
            </aside>
            <div className={`grow min-w-0 bg-[#EEEEEE] flex flex-col items-center`}>
                <div className="w-full h-20 bg-blue-600 flex items-center px-6">
                <div className="text-2xl font-bold tracking-wide text-white">
                  {title || "HỆ THỐNG BƠM TIẾP ÁP KHU CÔNG NGHIỆP"}
                </div>
                </div>
                <div className="w-[98%] border-[0.15px] border-[#9B9B9B]"></div>
                <main className="flex-1 w-full min-w-0 overflow-y-auto">{children}</main>
            </div>
        </div>
    )
}

export default MainLayout