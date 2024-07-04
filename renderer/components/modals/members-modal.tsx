import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"

import { useModal } from '@/lib/hooks/useModalStore'
import { db, storage } from '@/lib/firebaseConfig'
import { doc, updateDoc, getDoc, deleteField } from '@firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem } from '../ui/dropdown-menu'
import Loading from '../Loading'
import { getDownloadURL, ref } from 'firebase/storage'


const MembersModal = () => {
    const user = useAuth();
    const router = useRouter();
    let { serverId } = router.query;
    serverId = Array.isArray(serverId) ? serverId[0] : serverId;

    const { onOpen, isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "members";

    const { membersByRole } = data;

    let isOwner, isAdmin = false;
    if (membersByRole) {
        console.log(membersByRole.self);
        isOwner = membersByRole.self == 'owner';
        isAdmin = isOwner || membersByRole.self == 'admin';
    }

    const [isLoading, setIsLoading] = useState(false);

    const onRoleChange = async (userId, newRole) => {
        setIsLoading(true);
        try {
            const serverMemberRef = doc(db, 'serverMembers', serverId);
            await updateDoc(serverMemberRef, {
                [`${userId}.role`]: newRole
            });
            console.log(`User ${userId} role updated to ${newRole}`);
            // Reload the page with a QUERY PARAMETER to reopen the modal
            // router.replace({
            //     pathname: router.pathname,
            //     query: { ...router.query, openModal: 'members' }
            // });
            router.reload();
        } catch (error) {
            console.error("Error updating role: ", error);
        } finally {
            onClose();
            setIsLoading(false);
        }
    };

    const handleRoleChange = (userId, role) => {
        if (role === 'admin' || role === 'member') {
            onRoleChange(userId, role);
        }
    }

    const onKick = async (userId) => {
        setIsLoading(true);
        try {
            // Update serverMembers collection by deleting the field corresponding to server id
            const serverMemberRef = doc(db, 'serverMembers', serverId);
            if (serverMemberRef) {
                await updateDoc(serverMemberRef, {
                    [userId]: deleteField()
                });
                console.log(`User ${userId} kicked from the serverMembers collection`);
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
            router.reload(); 
        } catch (error) {
            console.error("Error kicking user: ", error);
        } finally {
            onClose();
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={ isModalOpen } onOpenChange={ onClose }>
            <DialogContent className='bg-dc-800'>
                <DialogHeader className='mb-4'>
                <DialogTitle className='text-center text-primary text-2xl'>Manage Members</DialogTitle>
                <DialogDescription className='text-center text-dc-500'>
                    Change roles and kick members with roles that are lower than yours.
                </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className='flex flex-col px-2 space-y-6'>
                        {membersByRole && membersByRole.ownerList.length > 0 && (
                            <div className='space-y-2'>
                                <p className='uppercase text-xs font-semibold tracking-widest text-primary/80'>owner</p>
                                {membersByRole.ownerList.map((user) => (
                                    <div className='flex w-full items-center p-2 rounded-md hover:bg-dc-700' key={user.username}>
                                        <div className='w-10 h-10 rounded-full overflow-hidden'>
                                            <img src={user.imageDownloadUrl} alt={user.username} />
                                        </div>
                                        <p className='ml-4'>{user.username}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {membersByRole && membersByRole.adminList.length > 0 && (
                            <div className=''>
                                <p className='uppercase text-xs font-semibold tracking-widest text-primary/80'>admin</p>
                                {membersByRole.adminList.map((user) => (
                                    <div className='flex w-full items-center p-2 rounded-md hover:bg-dc-700'>
                                        <div className='w-10 h-10 rounded-full overflow-hidden'>
                                            <img src={user.imageDownloadUrl} alt={user.username} />
                                        </div>
                                        <p className='ml-4'>{user.username}</p>
                                        { isOwner && (
                                            <DropdownMenu key={user.username} >
                                                <DropdownMenuTrigger className='ml-auto hover:text-secondary'>
                                                    <RiArrowDropDownLine size={28} />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side='right'>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            Role
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuCheckboxItem onClick={() => handleRoleChange(user.uid, 'admin')} checked disabled>
                                                                Admin
                                                            </DropdownMenuCheckboxItem>
                                                            <DropdownMenuCheckboxItem onClick={() => handleRoleChange(user.uid, 'member')}>
                                                                Member
                                                            </DropdownMenuCheckboxItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem className='text-red-500' onClick={() => onKick(user.uid)}>
                                                        Kick
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    ))}
                                </div>
                            
                        )}
                        {membersByRole && membersByRole.memberList.length > 0 && (
                            <div className=''>
                                <p className='uppercase text-xs font-semibold tracking-widest text-primary/80'>member</p>
                                {membersByRole.memberList.map((user) => (
                                    <div className='flex w-full items-center p-2 rounded-md hover:bg-dc-700'>
                                    <div className='w-10 h-10 rounded-full overflow-hidden'>
                                        <img src={user.imageDownloadUrl} alt={user.username} />
                                    </div>
                                    <p className='ml-4'>{user.username}</p>
                                    { isAdmin && (
                                        <DropdownMenu key={user.username} >
                                            <DropdownMenuTrigger className='ml-auto hover:text-secondary'>
                                                <RiArrowDropDownLine size={28} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side='right'>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        Role
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuCheckboxItem onClick={() => handleRoleChange(user.uid, 'admin')} >
                                                            Admin
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem onClick={() => handleRoleChange(user.uid, 'member')} checked disabled>
                                                            Member
                                                        </DropdownMenuCheckboxItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem className='text-red-500' onClick={() => onKick(user.uid)}>
                                                    Kick
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>

    )
}

export default MembersModal
