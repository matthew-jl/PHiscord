import Loading from "@/components/Loading";
import ServerSidebar from "@/components/ServerSidebar";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db, storage } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, doc, getDoc, query } from "@firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState } from "react";

type ServerPageProps = {
  children: ReactNode;
};

const ServerPage = ({ children }: ServerPageProps) => {
  const user = useAuth();
  const router = useRouter();
  const { serverId, channelId } = router.query;
  const activeServerId = Array.isArray(serverId) ? serverId[0] : serverId;
  const activeChannelId = Array.isArray(channelId) ? channelId[0] : channelId;

  const [isLoading, setIsLoading] = useState(true);

  const [currentUserRole, setCurrentUserRole] = useState(null);
  // Fetch data from 'servers', 'serverMembers', 'serverChannels' and set it to UseState
  const [serverData, setServerData] = useState(null);
  const [serverMemberData, setServerMemberData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  // 'serverChannels' and 'channels'
  const [serverChannelData, setServerChannelData] = useState(null);
  const [channelData, setChannelData] = useState([]);

  useEffect(() => {
    const fetchServerData = async () => {
      if (activeServerId && user) {
        setIsLoading(true);

        // serverChannels
        const serverChannelsRef = doc(db, "serverChannels", activeServerId);
        const serverChannelsSnap = await getDoc(serverChannelsRef);
        if (serverChannelsSnap.exists()) {
          setServerChannelData(serverChannelsSnap.data());
          console.log(serverChannelsSnap.data());

          //channels
          const channelPromises = Object.keys(serverChannelsSnap.data()).map(
            async (channelId) => {
              const channelRef = doc(db, "channels", channelId);
              const channelSnap = await getDoc(channelRef);
              if (channelSnap.exists()) {
                return { id: channelId, ...channelSnap.data() };
              } else {
                console.log(
                  `Failed to fetch channel data for channel ID: ${channelId}`
                );
                return null;
              }
            }
          );

          const channels = await Promise.all(channelPromises);
          setChannelData(channels.filter((channel) => channel !== null));
          console.log(channels);
          if (!activeChannelId) {
            const textChannelList = [];
            channels.forEach((channel: any) => {
              if (channel.type === "text") {
                textChannelList.push(channel);
              }
            });
            textChannelList.sort((a, b) => a.name.localeCompare(b.name));
            if (textChannelList.length > 0) {
              router.push(
                `/servers/${activeServerId}/channels/${textChannelList[0].id}/ChannelPage`
              );
            }
          }
        } else {
          console.log("failed to fetch serverChannels data");
        }

        // if user is not part of server, then redirect to home
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          if (!Object.keys(userSnap.data()).includes("servers")) {
            console.log("you are not a member of any server");
            router.push("/home");
            return;
          }
          if (!userSnap.data().servers[activeServerId]) {
            console.log("you are not a member of this server");
            router.push("/home");
            return;
          }
        }

        // servers
        const serverRef = doc(db, "servers", activeServerId);
        const serverSnap = await getDoc(serverRef);
        if (serverSnap.exists()) {
          setServerData({ id: activeServerId, ...serverSnap.data() });
          console.log(serverSnap.data());
        } else {
          console.log("failed to fetch servers data");
        }

        // serverMembers
        const serverMemberRef = doc(db, "serverMembers", activeServerId);
        const serverMemberSnap = await getDoc(serverMemberRef);
        if (serverMemberSnap.exists()) {
          setServerMemberData(serverMemberSnap.data());
          console.log(serverMemberSnap.data());

          // users
          const userPromises = Object.keys(serverMemberSnap.data()).map(
            async (userId) => {
              if (user.uid == userId) {
                setCurrentUserRole(serverMemberSnap.data()[userId].role);
                console.log(serverMemberSnap.data()[userId].role);
              }
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                if (Object.keys(userSnap.data()).includes("imageUrl")) {
                  const imageDownloadUrl = await getDownloadURL(
                    ref(storage, userSnap.data().imageUrl)
                  );
                  return { uid: userId, imageDownloadUrl, ...userSnap.data() };
                }
                return { uid: userId, ...userSnap.data() };
              } else {
                console.log(`Failed to fetch user data for user ID: ${userId}`);
                return null;
              }
            }
          );

          const users = await Promise.all(userPromises);
          setUsersData(users.filter((user) => user !== null));
          console.log(users);
        } else {
          console.log("failed to fetch serverMembers data");
        }

        setIsLoading(false);
      }
    };
    fetchServerData();
  }, [activeServerId, user]);

  if (!activeChannelId) {
    return <Loading />;
  }

  return (
    <>
      {/* <Sidebar activeServerId={ activeServerId } /> */}
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full h-screen flex pl-16 relative bg-dc-700">
          <ServerSidebar
            serverData={serverData}
            serverMemberData={serverMemberData}
            usersData={usersData}
            currentUserRole={currentUserRole}
            serverChannelData={serverChannelData}
            channelData={channelData}
          />
          {children}
        </div>
      )}
    </>
  );
};

export default ServerPage;
