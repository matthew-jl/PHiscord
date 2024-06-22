import React, { ReactNode } from 'react'
import { IconType } from 'react-icons'
import { IoMdAdd } from "react-icons/io"
import { FaCompass } from "react-icons/fa";
import { ModeToggle } from './mode-toggle';
import ThemeImage from './theme-image';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from './ui/tooltip';
import { useModal } from '@/lib/hooks/useModalStore';

const Sidebar = () => {
  const { onOpen } = useModal();

  return (
    // sidebar background
    <div className="fixed top-0 left-0 h-screen w-16 bg-dc-900 text-primary shadow-md flex flex-col" suppressHydrationWarning>

      <div className="flex flex-col items-center">
        <SidebarIconTheme icon= { <ModeToggle/> } tooltip="Change Theme"/>
        <SidebarIconDM icon={ 
          <ThemeImage srcLight="\images\discord-mark-black.png" srcDark='\images\discord-mark-white.png' alt="discord mark" width="27" height="27"/>
        } tooltip="Direct Messages"/>
        <Separator className="h-[2px] bg-dc-600 my-1 w-11 rounded-lg"/>
      </div>

      {/* scroll area for sidebar (has to be a fixed height to work) */}
      <ScrollArea className="h-fit w-full">
        {/* center scroll area items */}
        <div className='flex flex-col items-center'>
            <SidebarIcon icon={ <IoMdAdd size="27"/> } tooltip="Add a Server" onClick={() => onOpen('createServer')}/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>
            test
        </div>
      </ScrollArea>

    </div>
  )
}

type iconProps = {
  icon : ReactNode,
  tooltip: string,
  onClick?: () => void,
};

const SidebarIcon = ({icon, tooltip, onClick}: iconProps) => (
    <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
      <div className="sidebar-icon hover:bg-dc-green hover:text-primary" onClick={onClick}>
         { icon }
     </div>
      </TooltipTrigger>
      <TooltipContent side='right' align="center" sideOffset={10} className='font-semibold'>
        <p>{ tooltip }</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SidebarIconDM = ({icon, tooltip}: iconProps) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="sidebar-icon hover:bg-dc-blurple">
            { icon }
        </div>
      </TooltipTrigger>
      <TooltipContent side='right' align="center" sideOffset={10} className='font-semibold'>
        <p>{ tooltip }</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SidebarIconTheme = ({icon, tooltip}: iconProps) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="sidebar-icon bg-accent">
            { icon }
        </div>
      </TooltipTrigger>
      <TooltipContent side='right' align="center" sideOffset={10} className='font-semibold'>
        <p>{ tooltip }</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default Sidebar