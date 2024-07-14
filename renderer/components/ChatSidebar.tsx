import React, { useEffect, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { FaUserFriends } from 'react-icons/fa'
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc, onSnapshot } from '@firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import { Input } from './ui/input';

const ChatSidebar = () => {
    const user = useAuth();
    const router = useRouter();
    const { chatId } = router.query;
    const friendsIsActive = router.pathname === '/chats/FriendPage';
    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, async (userSnap) => {
            if (!userSnap.exists()) return;
            const userData = userSnap.data();
            const chatIds = Object.keys(userData.chats || {});

            const chatRefs = chatIds.map((chatId) => doc(db, 'chats', chatId));

            const chatUnsubscribes = chatRefs.map((chatRef) =>
                onSnapshot(chatRef, async (chatSnap) => {
                    if (!chatSnap.exists()) return;

                    const chat = chatSnap.data();
                    const otherUserId = chat.user1 === user.uid ? chat.user2 : chat.user1;
                    const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
                    if (!otherUserDoc.exists()) return;

                    const otherUserData = otherUserDoc.data();
                    let otherUserImageUrl = '';
                    if (otherUserData.imageUrl) {
                        otherUserImageUrl = await getDownloadURL(ref(storage, otherUserData.imageUrl));
                    }

                    setChats((prevChats) => {
                        const updatedChats = prevChats.filter((c) => c.chatId !== chatSnap.id);
                        updatedChats.push({
                            chatId: chatSnap.id,
                            userId: otherUserId,
                            username: otherUserData.username,
                            userImageUrl: otherUserImageUrl,
                            timestamp: chat.timestamp ? chat.timestamp.toMillis() : 0,
                        });
                        return updatedChats.sort((a, b) => b.timestamp - a.timestamp);
                    });
                })
            );

            return () => {
                chatUnsubscribes.forEach((unsub) => unsub());
            };
        });

        return () => unsubscribe();
    }, [user]);

    const filteredChats = chats.filter(chat => 
        chat.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
        {/* Left Sidebar */}
        <div className="h-screen w-60 fixed top-0 left-16 bg-dc-800">
            {/* Top bar */}
            <div className='w-full h-12 shadow-md font-semibold flex items-center text-sm text-left'></div>
            {/* Friends Symbol and Messages */}
            <ScrollArea className='h-full pb-12'>
                <div className='flex flex-col px-2 py-3 space-y-4'>
                    <div 
                        className={`space-y-1 flex items-center rounded-md p-2 hover:bg-dc-700 ${friendsIsActive ? 'bg-dc-700 pointer-events-none' : ''}`}
                        onClick={() => router.push('/chats/FriendPage')}
                    >
                        <FaUserFriends size={18} />
                        <p className='ml-3'>Friends</p>
                    </div>
                    <div className='space-y-1'>
                        <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>direct messages</p>
                        <Input 
                            placeholder='Search conversations'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-sm mb-2'
                        />
                        {filteredChats.map((chat) => (
                                <ChatItem
                                    key={chat.chatId}
                                    chatId={chat.chatId}
                                    userId={chat.userId}
                                    username={chat.username}
                                    userImageUrl={chat.userImageUrl}
                                    onClick={() => router.push(`/chats/${chat.chatId}/ChatPage`)}
                                    active={chat.chatId === chatId}
                                />
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    </>
  )
}

type ChatItemProps = {
    chatId: string;
    userId: string;
    username: string;
    userImageUrl: string;
    onClick: () => void;
    active: boolean;
};

const ChatItem = ({ chatId, userId, username, userImageUrl, onClick, active }: ChatItemProps) => (
    <div 
    className={`flex items-center p-2 hover:bg-dc-700 rounded-md cursor-pointer ${active ? 'bg-dc-700 pointer-events-none' : ''}`}
    onClick={onClick}
    >
        <div className='w-10 h-10 rounded-full overflow-hidden'>
            <img src={userImageUrl} alt={username} className='w-full h-full object-cover' />
        </div>
        <div className='ml-4'>
            <p className='text-primary'>{username}</p>
        </div>
    </div>
);

export default ChatSidebar