import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "@firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebaseConfig";
import { ToastAction } from "../ui/toast";
import Link from "next/link";

interface NotificationContextValue {
  notifications: any[];
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();
  const user = useAuth();

  useEffect(() => {
    if (!user) return;

    const clearNotifications = async () => {
      await updateDoc(doc(db, "notifications", user.uid), {
        messages: [],
      });
      console.log("cleared notifications in db");
    };

    const unsubscribe = onSnapshot(
      doc(db, "notifications", user.uid),
      (doc) => {
        console.log(doc.data());
        if (doc.data()) {
          const messages = doc.data().messages;
          if (messages.length > 0) {
            const latestNotification = messages[messages.length - 1];
            if (!latestNotification.channelName) {
              toast({
                title: "New direct message",
                description: `${latestNotification.username}: ${latestNotification.content}`,
                action: (
                  <ToastAction altText="Go to Chat">
                    <Link href={`/chats/${latestNotification.chatId}/ChatPage`}>
                      Go to Chat
                    </Link>
                  </ToastAction>
                ),
              });
            } else {
              toast({
                title: `New message in ${latestNotification.serverName} #${latestNotification.channelName}`,
                description: `${latestNotification.username}: ${latestNotification.content}`,
                action: (
                  <ToastAction altText="Go to Channel">
                    <Link
                      href={`/servers/${latestNotification.serverId}/channels/${latestNotification.channelId}/ChannelPage`}
                    >
                      Go to Channel
                    </Link>
                  </ToastAction>
                ),
              });
            }
            clearNotifications();
          }
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
