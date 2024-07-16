import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, database, db } from "../firebaseConfig";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "@firebase/database";
import { doc, updateDoc } from "@firebase/firestore";

function useAuth() {
  const [user, setLocalUser] = useState<any | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        // console.log('There is a user.');
        setLocalUser(user);
      } else {
        // console.log('There is no user logged in.')
        setLocalUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
}

function useAuthWithLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuth();

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false); // Stop loading when user is defined (either user object or null)
    }
  }, [user]);

  return { user, isLoading };
}

export { useAuth, useAuthWithLoading };
