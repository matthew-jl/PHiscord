import ChatSidebar from '@/components/ChatSidebar';
import Loading from '@/components/Loading'
import Sidebar from '@/components/Sidebar'
import React, { ReactNode, useState } from 'react'

type FriendPageProps = {
    children: ReactNode;
};

const FriendPage = ({ children }: FriendPageProps) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
    <>
        <Sidebar chatIsActive />
        {isLoading ? (
                <Loading />
            ) : (
                <div className="w-full h-screen flex pl-16 relative bg-red-900">
                    <ChatSidebar />
                    { children }
                </div> 
            )}
    </>
    )
}

export default FriendPage