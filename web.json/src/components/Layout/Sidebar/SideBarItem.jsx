import cl from "classnames"
import { useState } from "react"
import { IoChevronDownSharp } from "react-icons/io5"
import { IoChevronBackSharp } from "react-icons/io5"
import { MdRadioButtonChecked } from "react-icons/md"
import { useNavigate } from "react-router-dom"

function SideBarItem({ Icon, label, actived, isExpand, onClick, listItem }) {
    const [showList, setShowList] = useState(false)
    const navigate = useNavigate()
    return (
        <div className="w-full min-h-20 flex-col justify-start items-center">
            <div
                data-component="SidebarItem"
                className={cl("my-2 flex w-[98%] h-[90%] cursor-pointer justify-between items-center rounded-xl p-2 text-xl ", {
                    "bg-white/20": actived && !showList,
                    "hover:bg-white/10": !actived,
                })}
                onClick={onClick}
            >
                <div className="w-[80%] flex gap-2 justify-start items-center">
                    <div className="w-[15%] flex justify-center items-center">
                        <Icon strokeWidth={2} className="text-white h-full w-[80%] text-sm" />
                    </div>
                    <div className="w-[79%]">
                        <h5 className={cl("ml-3 text-white font-semibold")}>{label}</h5>
                    </div>
                </div>
                {/* <div
                    onClick={(e) => {
                        setShowList(showList ? false : true)
                        e.stopPropagation()
                    }}
                    className="w-[15%] flex justify-start items-center"
                >
                    {showList ? (
                        <IoChevronDownSharp className="text-white" />
                    ) : (
                        <IoChevronBackSharp className="text-white" />
                    )}
                </div> */}
            </div>
            {/* {showList && (
                <div
                    className={`flex flex-col justify-evenly items-start bg-[rgba(219,219,219,0.27)] text-white font-medium pl-8`}
                >
                    {listItem.map((subItem, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 hover:cursor-pointer min-h-[35px]"
                            onClick={() => navigate(subItem.link)}
                        >
                            <div className="flex">
                                <subItem.icon />
                            </div>
                            <div className="flex flex-col text-[0.9rem]">
                                <div>{subItem.label}</div>
                                <div className="text-[0.8rem]">{subItem.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )} */}
        </div>
    )
}

export default SideBarItem