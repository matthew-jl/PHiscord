import Loading from '@/components/Loading';
import ServerSidebar from '@/components/ServerSidebar';
import Sidebar from '@/components/Sidebar';
import { db } from '@/lib/firebaseConfig';
import useAuth from '@/lib/hooks/useAuth';
import { collection, doc, getDoc, query } from '@firebase/firestore';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const serverPage = () => {
    const user = useAuth();
    const router = useRouter();
    const { serverId } = router.query;
    const activeServerId = Array.isArray(serverId) ? serverId[0] : serverId;

    const [isLoading, setIsLoading] = useState(true);

    const [currentUserRole, setCurrentUserRole] = useState(null);
    // Fetch data from 'servers', 'serverMembers', 'serverChannels' and set it to UseState
    const [serverData, setServerData] = useState(null);
    const [serverMemberData, setServerMemberData] = useState(null);
    const [usersData, setUsersData] = useState(null);
    useEffect(() => {
        const fetchServerData = async () => {
            if (activeServerId && user) {
                // servers
                setIsLoading(true);
                const serverRef = doc(db, 'servers', activeServerId);
                const serverSnap = await getDoc(serverRef);
                if (serverSnap.exists()) {
                    setServerData(serverSnap.data());
                    console.log(serverSnap.data());
                } else {
                    console.log('failed to fetch servers data')
                }

                // serverMembers
                const serverMemberRef = doc(db, 'serverMembers', activeServerId);
                const serverMemberSnap = await getDoc(serverMemberRef);
                if (serverMemberSnap.exists()) {
                    setServerMemberData(serverMemberSnap.data());
                    console.log(serverMemberSnap.data());

                    // users
                    const userPromises = Object.keys(serverMemberSnap.data()).map(async (userId) => {
                        if (user.uid == userId) {
                            setCurrentUserRole(serverMemberSnap.data()[userId].role);
                            console.log(serverMemberSnap.data()[userId].role);
                        }
                        const userRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            return { uid: userId, ...userSnap.data() };
                        } else {
                            console.log(`Failed to fetch user data for user ID: ${userId}`);
                            return null;
                        }
                    });
  
                    const users = await Promise.all(userPromises);
                    setUsersData(users.filter(user => user !== null));
                    console.log(users);
                } else {
                    console.log('failed to fetch serverMembers data')
                }

                // serverChannels

                setIsLoading(false);
            }
        }
        fetchServerData();
    }, [activeServerId, user]);

    return (
        <>
            <Sidebar activeServerId={ activeServerId } />
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className="w-full h-screen flex pl-16 relative bg-red-900">
                        <ServerSidebar 
                            serverData={ serverData } 
                            serverMemberData = { serverMemberData } 
                            usersData = { usersData }
                            currentUserRole = { currentUserRole }    
                        />
                        <div className="w-full ml-60 bg-dc-700">This is { serverData?.name }</div>
                    </div> 
                )}
        </>
    )
}

export default serverPage