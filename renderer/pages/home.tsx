import React, { useEffect } from "react";

import { useAuth } from "@/lib/hooks/useAuth";
import Loading from "@/components/Loading";
import { useRouter } from "next/router";

export default function HomePage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to /chats/FriendPage if user is logged in
      router.push("/chats/FriendPage");
    }
  }, [user]);

  return (
    <>
      <Loading />
    </>
  );
}
