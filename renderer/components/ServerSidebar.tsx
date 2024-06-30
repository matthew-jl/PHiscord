import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import { ScrollArea } from './ui/scroll-area';
import { useModal } from '@/lib/hooks/useModalStore';

// interface ServerData {
//     name: string,
// }

type serverSidebarProps = {
    serverData: any,
    serverMemberData: any,
    usersData: any,
    currentUserRole: string,
    activeServerId: string,
}

const ServerSidebar = ({ serverData, serverMemberData, usersData, currentUserRole, activeServerId }: serverSidebarProps) => {

    const { onOpen } = useModal();

    const isOwner = currentUserRole == 'owner';
    const isAdmin = isOwner || currentUserRole == 'admin';
    // const isMember = currentUserRole == 'member';
  return (
    <>
        {/* Left Sidebar */}
        <div className="h-screen w-60 fixed top-0 left-16 bg-dc-800">
            <DropdownMenu>
                <DropdownMenuTrigger className='w-full h-12 shadow-md font-semibold flex items-center text-sm text-left'>
                    <div className='grow pl-4'>{ serverData.name }</div>
                    <RiArrowDropDownLine size={28} className='mx-2'/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                    <DropdownMenuItem onClick={() => onOpen("invite", { inviteCode: serverData.inviteCode })}>
                        Invite People
                        <IoMdPersonAdd className='ml-auto'/>
                    </DropdownMenuItem>
                    { isAdmin && (
                        <DropdownMenuItem>Server Settings</DropdownMenuItem>
                    )}
                    { isAdmin && (
                        <DropdownMenuItem>Create Channel</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-500'>Leave Server</DropdownMenuItem>
                    { isOwner && (
                        <DropdownMenuItem className='text-red-500'>Delete Server</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ScrollArea className='h-full pb-12'>
                <div className='flex flex-col space-y-20'>
                    channel list:
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
        {/* Right Sidebar */}
        <div className="h-screen w-60 fixed top-0 right-0 bg-dc-800">
            <ScrollArea className='h-full'>
                <div className='flex flex-col space-y-24'>
                    member list:
                    { usersData.map((user) => (
                        <p>{ user.username }</p>
                    ))}
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
    </>
  )
}

export default ServerSidebar