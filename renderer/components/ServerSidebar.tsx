import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdAddCircle, IoMdPersonAdd } from "react-icons/io";
import { IoChatbubbleEllipses, IoSettingsSharp } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { MdDelete } from "react-icons/md";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { ScrollArea } from './ui/scroll-area';
import { useModal } from '@/lib/hooks/useModalStore';
import { FaHashtag, FaUsersCog } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { and, collection, deleteDoc, deleteField, doc, getDoc, getDocs, or, query, serverTimestamp, setDoc, updateDoc, where } from '@firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/hooks/useAuth';
import { v4 } from 'uuid';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
    const user = useAuth();
    const router = useRouter();

    let { channelId } = router.query;
    channelId = Array.isArray(channelId) ? channelId[0] : channelId;

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
                    if (memberData.nickname) {
                        ownerList.push({...userData, username: memberData.nickname });
                    } else {
                        ownerList.push(userData);
                    }
                    break;
                case 'admin':
                    if (memberData.nickname) {
                        adminList.push({...userData, username: memberData.nickname });
                    } else {
                        adminList.push(userData);
                    }
                    break;
                case 'member':
                    if (memberData.nickname) {
                        memberList.push({...userData, username: memberData.nickname });
                    } else {
                        memberList.push(userData);
                    }
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
    textChannelList.sort((a, b) => a.name.localeCompare(b.name));
    voiceChannelList.sort((a, b) => a.name.localeCompare(b.name));

    const serverId = serverData.id;
    const onLeave = async (userId) => {
        // setIsLoading(true);
        try {
            // Update serverMembers collection by deleting the field corresponding to server id
            const serverMemberRef = doc(db, 'serverMembers', serverId);
            if (serverMemberRef) {
                await updateDoc(serverMemberRef, {
                    [userId]: deleteField()
                });
                console.log(`User ${userId} removed from the serverMembers collection`);
            }

            // Update users collection
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.servers && userData.servers[serverId]) {
                    const updatedServers = { ...userData.servers };
                    delete updatedServers[serverId];
                    await updateDoc(userRef, { servers: updatedServers });
                    console.log(`Server ID ${serverId} removed from user ${userId}'s servers field`);
                }
            }
        } catch (error) {
            console.error("Error leaving user: ", error);
        } finally {
            router.push('/home')
            // setIsLoading(false);
        }
    };

    const sendFriendRequest = async (senderId, receiverId) => {
        // friendships
        const friendshipId = 'friendship' + v4();
        await setDoc(doc(db, 'friendships', friendshipId), {
            accepted: false,
            user1: senderId,
            user2: receiverId,
            timestamp: serverTimestamp(),
        });
        console.log('friend request sent');
        alert('successfully sent friend request');
    }

    const removeFriendRequest = async (senderId, receiverId) => {
        const friendshipsRef = collection(db, 'friendships');
        const q = query(friendshipsRef, 
            or( and( where('user1', '==', senderId), where('user2', '==', receiverId) ), 
                and( where('user1', '==', receiverId), where('user2', '==', senderId) )
            )
        );
        const qSnapshot = await getDocs(q);
        qSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        console.log('friend request removed');
        alert('successfully removed friend request');
    }

    const friendRequestExists = async (senderId, receiverId) => {
        const friendshipsRef = collection(db, 'friendships');
        const q = query(friendshipsRef, 
            or( and( where('user1', '==', senderId), where('user2', '==', receiverId) ), 
                and( where('user1', '==', receiverId), where('user2', '==', senderId) )
            )
        );
        const qSnapshot = await getDocs(q);
        if (qSnapshot.empty) {
            return false;
        }
        return true;
    }

    const checkFriendshipExists = async (senderId, receiverId) => {
        const friendshipsRef = collection(db, 'friendships');
        const q = query(friendshipsRef, 
            or( and( where('user1', '==', senderId), where('user2', '==', receiverId) ), 
                and( where('user1', '==', receiverId), where('user2', '==', senderId) )
            )
        );
        const qSnapshot = await getDocs(q);
        for (const doc of qSnapshot.docs) {
            if (doc.data().accepted) {
                return true;
            }
        };
        return false;
    }

    const removeFriendship = async (user1Id, user2Id) => {
        const friendshipsRef = collection(db, 'friendships');
        const q = query(friendshipsRef, 
            or( and( where('user1', '==', user1Id), where('user2', '==', user2Id) ), 
                and( where('user1', '==', user2Id), where('user2', '==', user1Id) )
            )
        );
        const qSnapshot = await getDocs(q);
        qSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        alert('successfully removed friend');
    }

    type memberItemProps = {
        uid: string,
        username: string,
        icon?: string,
        customStatus?: string,
    }

    const MemberItem = ({ uid, username, icon, customStatus }: memberItemProps) => {
        const [friendshipExists, setFriendshipExists] = useState(false);
        const [friendRequestSent, setFriendRequestSent] = useState(false);
        const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
        const [newNickname, setNewNickname] = useState('');

        useEffect(() => {
            const checkFriendRequest = async () => {
                if (user && user.uid) {
                    const friendshipExists = await checkFriendshipExists(user.uid, uid);
                    setFriendshipExists(friendshipExists);
                    const exists = await friendRequestExists(user.uid, uid);
                    setFriendRequestSent(exists);
                }
            }
            checkFriendRequest();
        }, [uid, user]);

        const handleSendFriendRequest = async () => {
            await sendFriendRequest(user.uid, uid);
            setFriendRequestSent(true);
        }

        const handleRemoveFriendRequest = async () => {
            await removeFriendRequest(user.uid, uid);
            setFriendRequestSent(false);
        }

        const handleRemoveFriendship = async () => {
            await removeFriendship(user.uid, uid);
            setFriendshipExists(false);
            setFriendRequestSent(false);
        }

        const handleUpdateNickname = async () => {
            try {
              await updateDoc(doc(db, 'serverMembers', serverId), {
                [`${uid}.nickname`]: newNickname
              });
              setIsNicknameModalOpen(false);
              alert('Nickname updated successfully');
              router.reload();
            } catch (error) {
              console.error('Error updating nickname:', error);
            }
          }

        return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild className='cursor-pointer'>
                <div className='w-full flex items-center space-x-3 p-2 rounded-md hover:bg-dc-700'>
                    <div className='bg-red-500 w-9 h-9 rounded-3xl overflow-hidden'>
                        {icon ? (
                            <img src={ icon } alt={ username } className='w-full h-full object-cover'/>
                        ) : (
                            <img src='\images\profile-picture-placeholder-yellow.png' alt={ username } />
                        )
                        }
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-sm'>{ username }</span>
                        <span className='text-xs italic'>{ customStatus }</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                { user && uid === user.uid ? (
                    <DropdownMenuItem onClick={() => setIsNicknameModalOpen(true)}>Change Nickname</DropdownMenuItem>
                ) : (
                    <>
                        { !friendshipExists ? (
                            <>
                                { friendRequestSent ? (
                                    <DropdownMenuItem onClick={handleRemoveFriendRequest}>Cancel Friend Request</DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={handleSendFriendRequest}>Send Friend Request</DropdownMenuItem>
                                )}
                            </>
                        ) : (
                            <DropdownMenuItem onClick={handleRemoveFriendship}>Remove Friend</DropdownMenuItem>
                        ) }
                        <DropdownMenuItem>Message</DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={isNicknameModalOpen} onOpenChange={setIsNicknameModalOpen}>
          <DialogContent className='bg-dc-800'>
            <DialogTitle>Change Nickname</DialogTitle>
            <div className='space-y-4'>
              <Input
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder='Enter new nickname (leave blank for no nickname)'
                className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
              />
              <Button variant='blurple' onClick={handleUpdateNickname}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
        </>
    )};

    type channelItemProps = {
        id: string,
        name: string,
        type: 'text' | 'voice',
        onClick?: () => void,
        active?: boolean,
    };

    const ChannelItem = ({ id, name, type, onClick, active }: channelItemProps) => (
        <div 
        className={`w-full flex items-center space-x-2 p-2 rounded-md cursor-pointer ${active ? 'bg-dc-600 hover:bg-dc-600 pointer-events-none' : 'hover:bg-dc-700'}`} 
        {...(!active && { onClick:onClick })}
        >
            { type=='text' && (
                <FaHashtag size={14}/>
            )}
            { type=='voice' && (
                <HiMiniSpeakerWave size={16} />
            )}
            <div className='text-primary text-sm'>{ name }</div>
            <div className='grow'/>
            { isAdmin && (
                <IoSettingsSharp size={14} className={`${!active && 'hidden'} pointer-events-auto`} onClick={() => onOpen('editChannel')} />
            )}
        </div>
    );

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
                        <DropdownMenuItem onClick={() => onOpen('createChannel')}>
                            Create Channel
                            <IoMdAddCircle className='ml-auto' />
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    { !isOwner && user && (
                        <DropdownMenuItem className='text-red-500' onClick={() => onLeave(user.uid)}>
                            Leave Server
                            <ImExit className='ml-auto' />
                        </DropdownMenuItem>
                    )}
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
                                <ChannelItem 
                                id={ channel.id }
                                name={ channel.name } 
                                type={ channel.type } 
                                key={ channel.id } 
                                onClick={() => router.push(`/servers/${serverId}/channels/${channel.id}/ChannelPage`)}
                                active={ channelId == channel.id }
                                />
                            ))}
                        </div>
                    )}
                    { voiceChannelList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>voice channels</p>
                            { voiceChannelList.map((channel) => (
                                <ChannelItem id={ channel.id } name={ channel.name } type={ channel.type } key={ channel.id }/>
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
                                <MemberItem 
                                uid={ user.uid }
                                username={ user.username } 
                                icon={ user.imageDownloadUrl } 
                                key={ user.uid } 
                                customStatus={ user?.customStatus }/>
                            ))}
                        </div>
                    )}
                    { adminList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>admin</p>
                            {adminList.map((user) => (
                                <MemberItem 
                                uid={ user.uid }
                                username={ user.username } 
                                icon={ user.imageDownloadUrl } 
                                key={ user.uid } 
                                customStatus={ user?.customStatus }/>
                            ))}
                        </div>
                    )}
                    { memberList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>member</p>
                            {memberList.map((user) => (
                                <MemberItem 
                                uid={ user.uid }
                                username={ user.username } 
                                icon={ user.imageDownloadUrl } 
                                key={ user.uid } 
                                customStatus={ user?.customStatus }/>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    </>
  )
}

export default ServerSidebar