import React from 'react'
import { ScrollArea } from './ui/scroll-area'
import { FaUserFriends } from 'react-icons/fa'
import { useRouter } from 'next/router';

const ChatSidebar = () => {
    const router = useRouter();
    const friendsIsActive = router.pathname === '/chats/FriendPage';

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
                    </div>
                </div>
            </ScrollArea>
        </div>
    </>
  )
}

export default ChatSidebar