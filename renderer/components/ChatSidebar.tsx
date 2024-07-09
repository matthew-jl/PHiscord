import React from 'react'
import { ScrollArea } from './ui/scroll-area'

const ChatSidebar = () => {
  return (
    <>
        {/* Left Sidebar */}
        <div className="h-screen w-60 fixed top-0 left-16 bg-dc-800">
            {/* Top bar */}
            <div className='w-full h-12 shadow-md font-semibold flex items-center text-sm text-left'></div>
            {/* Friends Symbol and Messages */}
            <ScrollArea className='h-full pb-12'>
                <div className='flex flex-col px-2 py-3 space-y-4'>
                    <div className='space-y-1'>
                        <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>friends</p>
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