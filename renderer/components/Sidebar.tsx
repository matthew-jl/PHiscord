import React, { ReactNode, useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { IoMdAdd } from "react-icons/io"
import { FaCompass } from "react-icons/fa";
import { ModeToggle } from './mode-toggle';
import ThemeImage from './theme-image';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from './ui/tooltip';
import { useModal } from '@/lib/hooks/useModalStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc } from '@firebase/firestore';
import { db, storage } from '@/lib/firebaseConfig';
import { useRouter } from 'next/router';
import { getDownloadURL, ref } from 'firebase/storage';
import Loading from './Loading';
import Link from 'next/link';

const Sidebar = ({ activeServerId }: { activeServerId?: string }) => {
  const { onOpen } = useModal();
  const user = useAuth();
  const [servers, setServers] = useState([]);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      if (!user) return;

      setIsLoading(true);

      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const userServers = userData.servers || {};

      // Fetch server details
      const serverPromises = Object.keys(userServers).map(async (serverId) => {
        const serverDoc = await getDoc(doc(db, 'servers', serverId));
        const serverData = serverDoc.data();

        // Fetch download URL for server image
        const imageDownloadUrl = await getDownloadURL(ref(storage, serverData.imageUrl));

        const serverName = serverData.name;

        return { id: serverId, ...serverData, imageDownloadUrl, name: serverName };
      });

      let serverData = await Promise.all(serverPromises);

      // Sort the servers by name (or any other field)
      serverData = serverData.sort((a, b) => a.name.localeCompare(b.name));

      setServers(serverData);

      setIsLoading(false);
    };

    fetchServers();
  }, [user]);

  return (
    <>
      { isLoading ? (
        <Loading /> 
      ) : (
      // sidebar background
      <div className="fixed top-0 left-0 h-screen w-16 bg-dc-900 text-primary shadow-md flex flex-col z-50" suppressHydrationWarning>

        <div className="flex flex-col items-center">
          <Link href='/home'>home</Link>
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

              {/* Print each server the user is in as a sidebar icon */}
              {servers.map((server) => (
                <SidebarIcon
                  key={server.id}
                  icon={<img src={server.imageDownloadUrl} alt={server.name} />}
                  tooltip={server.name}
                  onClick={() => router.push(`/servers/${server.id}/ServerPage`)}
                  active={activeServerId === server.id}
                />
              ))}

              <SidebarIcon icon={ <IoMdAdd size="27"/> } tooltip="Add a Server" onClick={() => onOpen('createServer')}/>
              <SidebarIcon icon={ <FaCompass size="27"/> } tooltip="Explore Servers"/>

              {/* Just to test scroll area */}
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
      )}
    </>
  )
}

type iconProps = {
  icon : ReactNode,
  tooltip: string,
  onClick?: () => void,
  active?: boolean,
};

const SidebarIcon = ({ icon, tooltip, onClick, active = false }: iconProps) => (
    <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
      <div className={`sidebar-icon hover:bg-dc-green hover:text-primary ${active ? 'border-2 border-dc-green rounded-xl' : ''}`} onClick={onClick}>
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