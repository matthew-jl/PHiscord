import Sidebar from '@/components/Sidebar';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from '@firebase/firestore';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const serverPage = () => {
    const router = useRouter();
    const { serverId } = router.query;
    const activeServerId = Array.isArray(serverId) ? serverId[0] : serverId;

    const [isLoading, setIsLoading] = useState(true);

    // Fetch server data and set it to UseState
    const [serverData, setServerData] = useState(null);

    useEffect(() => {
        const fetchServerData = async () => {
            if (activeServerId) {
                setIsLoading(true);
                const serverRef = doc(db, 'servers', activeServerId);
                const serverSnap = await getDoc(serverRef);
                if (serverSnap.exists()) {
                    setServerData(serverSnap.data());
                    console.log(serverSnap.data());
                } else {
                    console.log('failed to fetch server data')
                }
                setIsLoading(false);
            }
        }
        fetchServerData();
    }, [activeServerId]);

    return (
        <>
            <Sidebar activeServerId={ activeServerId } />
            <div className="w-full h-screen flex justify-center pl-16">
                {isLoading ? (
                    <div>
                        Loading...
                    </div>
                ) : (
                    <div>This is { serverData.name }</div>
                )}
            </div>
        </>
    )
}

export default serverPage