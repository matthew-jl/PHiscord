import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import SignoutButton from "@/components/SignoutButton";

import { useAuth } from "@/lib/hooks/useAuth";
import { doc, getDoc } from "@firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import InitialModal from "@/components/modals/initial-modal";
import Loading from "@/components/Loading";

export default function HomePage() {

    const user = useAuth();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // have to use useEffect because fetching data is an asynchronous operation
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            // If user is logged in,
            if (user) {
                // Read data from "users" collection in Cloud Firestore database
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    console.log("Current user: ", userSnap.data());
                    setUserData(userSnap.data());
                } else {
                    // userSnap.data() will be undefined
                    console.log("Current user undefined.")
                }
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, [user]);

    return (
        <React.Fragment>
            { isLoading ? (
                <Loading />
            ) : (
            <>
            <Sidebar />
                <div className="w-full h-screen flex justify-center pl-16">
                    {/* conditional rendering if userData exists (user logged in) */}
                    {userData && <p>Hello, {userData.username}</p>}

                    <Link href="/next" className={buttonVariants()}>
                        Go to next page
                    </Link>
                    <Link href="/login" className={buttonVariants()}>
                        Go to login page
                    </Link>
                    <Link href="/register" className={buttonVariants()}>
                        Go to register page
                    </Link>
                    <SignoutButton />
                    <Link href="http://localhost:8888/invite/36c4a625-332e-43b0-b03f-8947a16ac5bf/InviteCodePage" className="hover:underline">test</Link>
                    <Link href="http://localhost:8888/servers/f8497110-be89-4dd5-9954-24da586002be/ServerPage" className="hover:underline">try to hack</Link>
                </div>
            </>
            )}
        </React.Fragment>
    );

}
