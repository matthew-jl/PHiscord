"use client"

import InitialModal from "@/components/modals/initial-modal"
import { useEffect, useState } from "react";
import InviteModal from "@/components/modals/invite-modal";

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
        </>
    )
}