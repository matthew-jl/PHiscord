'use client';

import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/hooks/useAuth";
import { doc, getDoc } from "@firebase/firestore";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import '@livekit/components-styles';

interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
}

const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
    const user = useAuth();
    const [token, setToken] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                console.log('failed to fetch user data');
                return;
            }
            const userData = userDoc.data();
            setUserData(userData);
        }
        fetchUserData();
    }, [user]);

    useEffect(() => {
        if (!user || !userData) return;
        const name = userData.username;
        (async () => {
            try {
                const resp = await fetch(`/api/get_lk_token?room=${chatId}&username=${name}`);
                const data = await resp.json();
                setToken(data.token)
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userData, chatId]);

    if (token === '') {
        return (
            <Loading />
        )
    }

  return (
    <LiveKitRoom
        data-lk-theme='default'
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        audio={audio}
        video={video}
        connect={true}
    >
        <VideoConference />
    </LiveKitRoom>
  )
}

export default MediaRoom