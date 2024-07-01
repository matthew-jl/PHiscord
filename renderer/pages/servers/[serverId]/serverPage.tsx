import Loading from '@/components/Loading';
import ServerSidebar from '@/components/ServerSidebar';
import Sidebar from '@/components/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/hooks/useAuth';
import { collection, doc, getDoc, query } from '@firebase/firestore';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const ServerPage = () => {
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
                setIsLoading(true);
                // if user is not part of server, then redirect to home
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    if (!Object.keys(userSnap.data()).includes('servers')) {
                        console.log('you are not a member of any server');
                        router.push('/home');
                        return;
                    }
                    if (!userSnap.data().servers[activeServerId]) {
                        console.log('you are not a member of this server');
                        router.push('/home');
                        return;
                    }
                }

                // servers
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
                            activeServerId = { activeServerId }
                            serverData={ serverData } 
                            serverMemberData = { serverMemberData } 
                            usersData = { usersData }
                            currentUserRole = { currentUserRole }    
                        />
                        <div className="grow h-screen mx-60 bg-dc-700 flex flex-col">
                            <div className='w-full min-h-12 shadow-md font-semibold flex items-center text-sm text-left'>
                                <div className='grow pl-4'>channel placeholder</div>
                            </div>
                            <ScrollArea className='h-full'>
                                This is { serverData?.name }
                                <div className='flex flex-col space-y-20'>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder</p>
                                    <p>placeholder2</p>
                                </div>
                            </ScrollArea>
                        </div>
                    </div> 
                )}
        </>
    )
}

export default ServerPage