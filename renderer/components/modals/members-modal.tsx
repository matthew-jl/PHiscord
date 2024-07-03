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
import { Button } from "@/components/ui/button"

import { useModal } from '@/lib/hooks/useModalStore'
import { db, storage } from '@/lib/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc } from '@firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'
import { v4 } from 'uuid'


const MembersModal = () => {
    const user = useAuth();
    const router = useRouter();
    let { serverId } = router.query;
    serverId = Array.isArray(serverId) ? serverId[0] : serverId;

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "members";

    const { membersByRole } = data?.membersByRole ?? {};
    // console.log(membersByRole.self);
    const isOwner = membersByRole.self == 'owner';
    const isAdmin = isOwner || membersByRole.self == 'admin';

    const [serverData, setServerData] = useState(null);

    useEffect(() => {
        if (serverId && user) {
            const fetchServerData = async () => {
                const serverRef = doc(db, 'servers', serverId);
                const serverSnap = await getDoc(serverRef);
                if (serverSnap.exists()) {
                    const data = serverSnap.data();
                    setServerData(data);
                }
            }
            fetchServerData();
        }
    }, [serverId, user]);

    return (
        <Dialog open={ isModalOpen } onOpenChange={ onClose }>
            <DialogContent className='bg-dc-800'>
                <DialogHeader className='mb-4'>
                <DialogTitle className='text-center text-primary text-2xl'>Manage Members</DialogTitle>
                <DialogDescription className='text-center text-dc-500'>
                    Change roles and kick members with roles that are lower than yours.
                </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col px-2 py-6 space-y-8'>
                    { membersByRole.ownerList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>owner</p>
                            {membersByRole.ownerList.map((user) => (
                                <div className='flex w-full'>
                                    <div className='w-8 h-8 rounded-full overflow-hidden'>
                                        <img src={ user.imageDownloadUrl } alt={ user.username } />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* { membersByRole.adminList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>admin</p>
                            {membersByRole.adminList.map((user) => (
                                <MemberItem username={ user.username } key={ user.uid }/>
                            ))}
                        </div>
                    )}
                    { membersByRole.memberList.length > 0 && (
                        <div className='space-y-1'>
                            <p className='uppercase text-xs font-semibold tracking-widest text-primary/80 pl-2'>member</p>
                            {membersByRole.memberList.map((user) => (
                                <MemberItem username={ user.username } key={ user.uid }/>
                            ))}
                        </div>
                    )} */}
                </div>
            
            </DialogContent>
        </Dialog>

    )
}

export default MembersModal
