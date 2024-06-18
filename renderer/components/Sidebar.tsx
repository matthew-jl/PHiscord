import React, { ReactNode } from 'react'
import { IconType } from 'react-icons'
import { IoMdAdd } from "react-icons/io"
import { FaCompass } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-16 flex flex-col bg-gray-900 text-white shadow-lg">
        <SidebarIcon icon={ <img alt='logo' src="\images\discord-mark-white.png" width="27"/> } tooltip="Direct Messages"/>
        <SidebarIcon icon={ <IoMdAdd size="27"/> } tooltip="Add a Server"/>
        <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>

    </div>
  )
}

type iconProps = {
  icon : ReactNode,
  tooltip: string
};

const SidebarIcon = (icon: iconProps) => (
    <div className="sidebar-icon group">
        { icon.icon }
        <span className="sidebar-tooltip group-hover:scale-100">
          { icon.tooltip }
        </span>
    </div>
);

export default Sidebar