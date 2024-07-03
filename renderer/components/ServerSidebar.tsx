import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdAddCircle, IoMdPersonAdd } from "react-icons/io";
import { IoChatbubbleEllipses, IoSettingsSharp } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { MdDelete } from "react-icons/md";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { ScrollArea } from './ui/scroll-area';
import { useModal } from '@/lib/hooks/useModalStore';
import { FaUsersCog } from 'react-icons/fa';

// interface ServerData {
//     name: string,
// }

type serverSidebarProps = {
    serverData: any,
    serverMemberData: any,
    usersData: any,
    currentUserRole: string,
    channelData: any,
    serverChannelData: any
}

const ServerSidebar = ({ serverData, serverMemberData, usersData, currentUserRole, channelData, serverChannelData }: serverSidebarProps) => {

    const { onOpen } = useModal();

    const isOwner = currentUserRole == 'owner';
    const isAdmin = isOwner || currentUserRole == 'admin';
    // const isMember = currentUserRole == 'member';

    const ownerList = [];
    const adminList = [];
    const memberList = [];
    Object.keys(serverMemberData).forEach((userId) => {
        const memberData = serverMemberData[userId];
        const userData = usersData.find(user => user.uid === userId);
        if (userData) {
            switch (memberData.role) {
                case 'owner':
                    ownerList.push(userData);
                    break;
                case 'admin':
                    adminList.push(userData);
                    break;
                case 'member':
                    memberList.push(userData);
                    break;
                default:
                    break;
            }
        }
    });

    // for passing to manage members modal
    const membersByRole = {
        self: currentUserRole,
        ownerList: ownerList,
        adminList: adminList,
        memberList: memberList,
    };

    const textChannelList = [];
    const voiceChannelList = [];
    Object.keys(serverChannelData).forEach((channelId) => {
        const data = channelData.find(channel => channel.id === channelId );
        if (data) {
            switch (data.type) {
                case 'text':
                    textChannelList.push(data);
                    break;
                case 'voice':
                    voiceChannelList.push(data);
                    break;
                default:
                    break;
            }
        }
    });

  return (
    <>
        {/* Left Sidebar */}
        <div className="h-screen w-60 fixed top-0 left-16 bg-dc-800">
            {/* Top Dropdown */}
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
                        <DropdownMenuItem onClick={() => onOpen('editServer')}>
                            Server Settings
                            <IoSettingsSharp className='ml-auto' />
                        </DropdownMenuItem>
                    )}
                    { isAdmin && (
                        <DropdownMenuItem onClick={() => onOpen('members', { membersByRole: membersByRole })}>
                            Manage Members
                            <FaUsersCog className='ml-auto' />
                        </DropdownMenuItem>
                    )}
                    { isAdmin && (
                        <DropdownMenuItem>
                            Create Channel
                            <IoMdAddCircle className='ml-auto' />
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-500'>
                        Leave Server
                        <ImExit className='ml-auto' />
                    </DropdownMenuItem>
                    { isOwner && (
                        <DropdownMenuItem className='text-red-500'>
                            Delete Server
                            <MdDelete className='ml-auto'/>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {/* Channels */}
            <ScrollArea className='h-full pb-12'>
                <div className='flex flex-col px-2 py-3 space-y-4'>
                    { textChannelList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>text channels</p>
                            { textChannelList.map((channel) => (
                                <ChannelItem name={ channel.name } type={ channel.type } key={ channel.id }/>
                            ))}
                        </div>
                    )}
                    { voiceChannelList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>voice channels</p>
                            { voiceChannelList.map((channel) => (
                                <ChannelItem name={ channel.name } type={ channel.type } key={ channel.id }/>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
        {/* Right Sidebar */}
        <div className="h-screen w-60 fixed top-0 right-0 bg-dc-800">
            {/* Members */}
            <ScrollArea className='h-full'>
                <div className='flex flex-col px-2 py-6 space-y-8'>
                    { ownerList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>owner</p>
                            {ownerList.map((user) => (
                                <MemberItem username={ user.username } icon={ user.imageDownloadUrl } key={ user.uid }/>
                            ))}
                        </div>
                    )}
                    { adminList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>admin</p>
                            {adminList.map((user) => (
                                <MemberItem username={ user.username } key={ user.uid }/>
                            ))}
                        </div>
                    )}
                    { memberList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>member</p>
                            {memberList.map((user) => (
                                <MemberItem username={ user.username } key={ user.uid }/>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    </>
  )
}

type memberItemProps = {
    username: string,
    icon?: string,
}

const MemberItem = ({username, icon}: memberItemProps) => (
    <div className='w-full flex items-center space-x-3 p-2 rounded-md hover:bg-dc-700'>
        <div className='bg-red-500 w-9 h-9 rounded-3xl overflow-hidden'>
            {icon ? (
                <img src={ icon } alt={ username }/>
            ) : (
                <img src='\images\profile-picture-placeholder-yellow.png' alt={ username } />
            )
            }
        </div>
        <div className='text-primary text-sm'>{ username }</div>
    </div>
);

type channelItemProps = {
    name: string,
    type: 'text' | 'voice',
};

const ChannelItem = ({ name, type }: channelItemProps) => (
    <div className='w-full flex items-center space-x-2 p-2 rounded-md hover:bg-dc-700'>
        { type=='text' && (
            <IoChatbubbleEllipses size={20} />
        )}
        { type=='voice' && (
            <HiMiniSpeakerWave size={20} />
        )}
        <div className='text-primary text-sm'>{ name }</div>
    </div>
);

export default ServerSidebar