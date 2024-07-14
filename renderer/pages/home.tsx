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
import { useRouter } from "next/router";

export default function HomePage() {
    const user = useAuth();
    const router = useRouter();
    // const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
          // Redirect to /chats/FriendPage if user is logged in
          router.push('/chats/FriendPage');
        }
      }, [user]);

    // have to use useEffect because fetching data is an asynchronous operation
    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         setIsLoading(true);
    //         // If user is logged in,
    //         if (user) {
    //             // Read data from "users" collection in Cloud Firestore database
    //             const userRef = doc(db, "users", user.uid);
    //             const userSnap = await getDoc(userRef);
    //             if (userSnap.exists()) {
    //                 console.log("Current user: ", userSnap.data());
    //                 setUserData(userSnap.data());
    //             } else {
    //                 // userSnap.data() will be undefined
    //                 console.log("Current user undefined.")
    //             }
    //         }
    //         setIsLoading(false);
    //     };
    //     fetchUserData();
    // }, [user]);

    // return (
    //     <React.Fragment>
    //         { isLoading ? (
    //             <Loading />
    //         ) : (
    //         <>
    //         <Sidebar />
    //             <div className="w-full h-screen flex justify-center pl-16 bg-dc-900">
    //                 {/* conditional rendering if userData exists (user logged in) */}
    //                 {userData && <p>Hello, {userData.username}</p>}

    //                 <Link href="/next" className={buttonVariants()}>
    //                     Go to next page
    //                 </Link>
    //                 <Link href="/login" className={buttonVariants()}>
    //                     Go to login page
    //                 </Link>
    //                 <Link href="/register" className={buttonVariants()}>
    //                     Go to register page
    //                 </Link>
    //                 <SignoutButton />
    //                 <Link href="http://localhost:8888/invite/f2a7bd43-36f0-4a5e-bab1-8808c9ec48d4/InviteCodePage" className="hover:underline">test</Link>
    //                 <Link href="https://youtube.com" target='_blank' className="hover:underline">try to hack</Link>
    //             </div>
    //         </>
    //         )}
    //     </React.Fragment>
    // );

    return (
        <>
            <Loading />
        </>
    )

}
