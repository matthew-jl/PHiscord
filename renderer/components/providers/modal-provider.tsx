"use client"

import InitialModal from "@/components/modals/initial-modal"
import { useEffect, useState } from "react";
import InviteModal from "@/components/modals/invite-modal";
import EditServerModal from "@/components/modals/edit-server-modal";
import MembersModal from "@/components/modals/members-modal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <InitialModal />
            <InviteModal />
            <EditServerModal />
            <MembersModal />
        </>
    )
}