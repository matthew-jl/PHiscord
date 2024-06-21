import React, { ReactNode } from 'react'
import { IconType } from 'react-icons'
import { IoMdAdd } from "react-icons/io"
import { FaCompass } from "react-icons/fa";
import { ModeToggle } from './mode-toggle';
import ThemeImage from './theme-image';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-16 flex flex-col items-center bg-dc-900 text-primary shadow-md">
        <SidebarIcon icon={ 
          <ThemeImage srcLight="\images\discord-mark-black.png" srcDark='\images\discord-mark-white.png' alt="discord mark" width="27" height="27"/>
         } tooltip="Direct Messages"/>
        <SidebarIcon icon={ <IoMdAdd size="27"/> } tooltip="Add a Server"/>
        <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
        <ModeToggle />
        test
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