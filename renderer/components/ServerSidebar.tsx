import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";

// interface ServerData {
//     name: string,
// }

type serverSidebarProps = {
    serverData: any,
    serverMemberData: any,
    usersData: any,
    currentUserRole: string,
}

const ServerSidebar = ({ serverData, serverMemberData, usersData, currentUserRole }: serverSidebarProps) => {
    const isOwner = currentUserRole == 'owner';
    const isAdmin = isOwner || currentUserRole == 'admin';
    // const isMember = currentUserRole == 'member';
  return (
    <>
        {/* Left Sidebar */}
        <div className="h-screen w-60 fixed top-0 left-16 bg-dc-800">
            <div>
                <DropdownMenu>
                    <DropdownMenuTrigger className='w-full h-12 shadow-md font-semibold flex items-center text-sm text-left'>
                        <div className='grow pl-4'>{ serverData.name }</div>
                        <RiArrowDropDownLine size={28} className='mx-2'/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-56'>
                        <DropdownMenuItem>
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
            </div>
            channel list:
            
        </div>
        {/* Right Sidebar */}
        <div className="h-screen w-60 fixed top-0 right-0 bg-dc-800">
            member list:
            { usersData.map((user) => (
                <p>{ user.username }</p>
            ))}
        </div>
    </>
  )
}

export default ServerSidebar