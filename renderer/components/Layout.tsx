"use client";
import { useAuthWithLoading } from "@/lib/hooks/useAuth";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "@firebase/database";
import { database, db } from "@/lib/firebaseConfig";
import { doc, updateDoc } from "@firebase/firestore";
import TitleBar from "./TitleBar";

const Layout = ({ children }: { children: React.ReactElement }) => {
  // const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { user, isLoading } = useAuthWithLoading();

  // So that non-logged-in user can access login and register page
  const noAuthRequired = ["/login", "/register"];
  const isAuthPage = noAuthRequired.includes(router.pathname);

  // workaround for next/router can't be used in server-side.
  // use effects are always client-side.
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isAuthPage) {
        router.push("/login");
      }
    }
  }, [user, isLoading, isAuthPage, router]);

  useEffect(() => {
    if (!user) return;
    // Real-time online status setup
    const userStatusDatabaseRef = ref(database, `/status/${user.uid}`);

    const isOfflineForDatabase = {
      state: "offline",
      last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: "online",
      last_changed: serverTimestamp(),
    };

    const userStatusFirestoreRef = doc(db, "users", user.uid);

    const isOfflineForFirestore = {
      isOnline: false,
    };

    const isOnlineForFirestore = {
      isOnline: true,
    };

    onValue(ref(database, ".info/connected"), (snapshot) => {
      if (snapshot.val() == false) {
        updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
        return;
      }

      onDisconnect(userStatusDatabaseRef)
        .set(isOfflineForDatabase)
        .then(() => {
          set(userStatusDatabaseRef, isOnlineForDatabase);
          updateDoc(userStatusFirestoreRef, isOnlineForFirestore);
        });
    });

    window.addEventListener("beforeunload", () => {
      set(userStatusDatabaseRef, isOfflineForDatabase);
      updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
    });

    return () => {
      set(userStatusDatabaseRef, isOfflineForDatabase);
      updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
    };
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  if (user || isAuthPage) {
    return (
      <>
        <Head>
          <title>PHiscord</title>
        </Head>
        <TitleBar />
        <div>{children}</div>
      </>
    );
  } else {
    return <Loading />; // loading screen/spinner
  }
};

export default Layout;
