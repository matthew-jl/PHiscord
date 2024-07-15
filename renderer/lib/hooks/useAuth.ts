import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, database, db } from "../firebaseConfig";
import { onDisconnect, onValue, ref, serverTimestamp, set } from "@firebase/database";
import { doc, updateDoc } from "@firebase/firestore";

function useAuth() {
    const [user, setLocalUser] = useState<any | undefined>(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
            if (user) {
                // console.log('There is a user.');
                setLocalUser(user);

                 // Real-time online status setup
                const userStatusDatabaseRef = ref(database, `/status/${user.uid}`);

                const isOfflineForDatabase = {
                    state: 'offline',
                    last_changed: serverTimestamp(),
                };

                const isOnlineForDatabase = {
                    state: 'online',
                    last_changed: serverTimestamp(),
                };

                const userStatusFirestoreRef = doc(db, 'users', user.uid);

                const isOfflineForFirestore = {
                    isOnline: false,
                };

                const isOnlineForFirestore = {
                    isOnline: true,
                };

                onValue(ref(database, '.info/connected'), (snapshot) => {
                    if (snapshot.val() == false) {
                        updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
                        return;
                    }

                    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                        set(userStatusDatabaseRef, isOnlineForDatabase);
                        updateDoc(userStatusFirestoreRef, isOnlineForFirestore);
                    });
                });

                window.addEventListener('beforeunload', () => {
                    set(userStatusDatabaseRef, isOfflineForDatabase);
                    updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
                });

                return () => {
                    set(userStatusDatabaseRef, isOfflineForDatabase);
                    updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
                };
                
                } else {
                    // console.log('There is no user logged in.')
                    setLocalUser(null);
                }
                })

                return () => unsubscribe();
    }, [ ])

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