import Loading from "@/components/Loading";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const InviteCodePage = () => {
  const user = useAuth();
  const router = useRouter();
  const { inviteCode } = router.query;
  const activeInviteCode = Array.isArray(inviteCode)
    ? inviteCode[0]
    : inviteCode; // just to convert it to string

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const joinServer = async () => {
      if (!user) {
        console.log("no user logged in");
        return;
      }
      setIsLoading(true);

      // find server and get server data
      const serverRef = collection(db, "servers");
      const serverQuery = query(
        serverRef,
        where("inviteCode", "==", activeInviteCode)
      );
      const serverQuerySnap = await getDocs(serverQuery);
      if (serverQuerySnap.empty) {
        console.log("server not found through invite code");
        setIsLoading(false);
        return;
      }
      let serverId, serverData;
      serverQuerySnap.forEach((doc) => {
        serverId = doc.id;
        serverData = doc.data();
      });
      console.log(serverId, serverData);

      // if already joined, redirect to server page
      const serverMemberRef = doc(db, "serverMembers", serverId);
      const serverMemberSnap = await getDoc(serverMemberRef);
      if (!serverMemberSnap.exists) {
        console.log("serverMember not found");
        setIsLoading(false);
        return;
      }
      if (serverMemberSnap.data()[user.uid]) {
        toast({
          title: "Could not join server",
          description: "You are already a member of this server.",
        });
        console.log("you are already a member of this server.");
        router.push(`/servers/${serverId}/ServerPage`);
        return;
      }

      // create new serverMember
      await updateDoc(serverMemberRef, {
        [user.uid]: {
          joined: true,
          joinedAt: serverTimestamp(),
          role: "member",
        },
      });
      console.log("created serverMember");

      // update user's server to true
      await updateDoc(doc(db, "users", user.uid), {
        [`servers.${serverId}`]: true,
      });
      console.log("updated users");

      // redirect to server page
      toast({
        description: "Successfully joined server.",
      });
      router.push(`/servers/${serverId}/ServerPage`);
      setIsLoading(false);
    };
    joinServer();
  }, [user]);

  return <>{isLoading ? <Loading /> : <div>InvitePage</div>}</>;
};

export default InviteCodePage;
