import React, { ReactNode, useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { FaHeadphonesAlt, FaMicrophone } from "react-icons/fa";
import { ModeToggle } from "./mode-toggle";
import ThemeImage from "./theme-image";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useModal } from "@/lib/hooks/useModalStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { doc, getDoc } from "@firebase/firestore";
import { db, storage } from "@/lib/firebaseConfig";
import { useRouter } from "next/router";
import { getDownloadURL, ref } from "firebase/storage";
import Loading from "./Loading";
import Link from "next/link";
import { IoSettingsSharp } from "react-icons/io5";

const Sidebar = () => {
  const router = useRouter();
  const chatIsActive = router.pathname.includes("/chats");
  const { serverId } = router.query;
  const activeServerId = Array.isArray(serverId) ? serverId[0] : serverId;
  const { onOpen } = useModal();
  const user = useAuth();
  const [servers, setServers] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      if (!user) return;

      setIsLoading(true);

      // Fetch user data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.log("failed to fetch user data");
        return;
      }

      const userData = userDoc.data();
      setUserData(userData);

      // Profile picture URL
      const profilePictureUrl = await getDownloadURL(
        ref(storage, userData.imageUrl)
      );
      setProfilePicture(profilePictureUrl);

      const userServers = userData.servers || {};

      // Fetch server details
      const serverPromises = Object.keys(userServers).map(async (serverId) => {
        const serverDoc = await getDoc(doc(db, "servers", serverId));
        const serverData = serverDoc.data();

        // Fetch download URL for server image
        const imageDownloadUrl = await getDownloadURL(
          ref(storage, serverData.imageUrl)
        );

        const serverName = serverData.name;

        return {
          id: serverId,
          ...serverData,
          imageDownloadUrl,
          name: serverName,
        };
      });

      let serverData = await Promise.all(serverPromises);

      // Sort the servers by name (or any other field)
      serverData = serverData.sort((a, b) => a.name.localeCompare(b.name));

      setServers(serverData);

      setIsLoading(false);
    };

    fetchServers();
  }, [user]);

  if (
    router.pathname.includes("/login") ||
    router.pathname.includes("/register")
  )
    return;

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* sidebar background */}
          <div
            className="fixed top-6 left-0 h-screen w-16 bg-dc-900 text-primary shadow-md flex flex-col z-40"
            suppressHydrationWarning
          >
            <div className="flex flex-col items-center">
              <SidebarIconDM
                icon={
                  <ThemeImage
                    srcLight="\images\discord-mark-black.png"
                    srcDark="\images\discord-mark-white.png"
                    alt="discord mark"
                    width="27"
                    height="27"
                  />
                }
                tooltip="Direct Messages"
                onClick={() => router.push("/chats/FriendPage")}
                active={chatIsActive}
              />
              <Separator className="h-[2px] bg-dc-600 my-1 w-11 rounded-lg" />
            </div>

            {/* scroll area for sidebar (has to be a fixed height to work) */}
            <ScrollArea className="h-fit w-full">
              {/* center scroll area items */}
              <div className="flex flex-col items-center">
                {/* Print each server the user is in as a sidebar icon */}
                {servers.map((server) => (
                  <SidebarIcon
                    key={server.id}
                    icon={
                      <img
                        src={server.imageDownloadUrl}
                        alt={server.name}
                        className="w-full h-full object-cover"
                      />
                    }
                    tooltip={server.name}
                    onClick={() =>
                      router.push(`/servers/${server.id}/ServerPage`)
                    }
                    active={activeServerId === server.id}
                  />
                ))}

                <SidebarIcon
                  icon={<IoMdAdd size="27" />}
                  tooltip="Add a Server"
                  onClick={() => onOpen("createServer")}
                />
              </div>
            </ScrollArea>
          </div>
          {/* User Status Bar */}
          <div className="fixed bottom-0 left-16 w-60 h-12 bg-dc-900/70 z-30 flex items-center px-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={profilePicture}
                alt="Profile pic"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-sm">{userData.username}</span>
              <span className="text-xs italic">{userData?.customStatus}</span>
            </div>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <FaMicrophone size={16} className="mx-2 ml-auto" />
                </TooltipTrigger>
                <TooltipContent className="font-semibold">Mute</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <FaHeadphonesAlt size={16} className="mx-1" />
                </TooltipTrigger>
                <TooltipContent className="font-semibold">
                  Deafen
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <IoSettingsSharp
                    size={16}
                    className="mx-2 cursor-pointer"
                    onClick={() => onOpen("userSettings")}
                  />
                </TooltipTrigger>
                <TooltipContent className="font-semibold">
                  User Settings
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </>
  );
};

type iconProps = {
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
};

const SidebarIcon = ({ icon, tooltip, onClick, active = false }: iconProps) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`sidebar-icon hover:bg-dc-green hover:text-primary ${
            active
              ? "border-2 border-dc-green rounded-xl pointer-events-none"
              : ""
          }`}
          onClick={onClick}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={10}
        className="font-semibold"
      >
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SidebarIconDM = ({
  icon,
  tooltip,
  onClick,
  active = false,
}: iconProps) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`sidebar-icon hover:bg-dc-blurple ${
            active ? "bg-dc-blurple rounded-xl pointer-events-none" : ""
          }`}
          onClick={onClick}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={10}
        className="font-semibold"
      >
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default Sidebar;
