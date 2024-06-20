import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

function useAuth() {
    const [user, setLocalUser] = useState<any | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
            if (user) {
                console.log('There is a user.');
                setLocalUser(user);
            } else {
                console.log('There is no user logged in.')
                setLocalUser(null);
            }
        })
        return () => unsubscribe();
    }, [ ])

    return user;
}

export default useAuth;