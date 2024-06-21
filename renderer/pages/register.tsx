import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebaseConfig';
import useAuth from '@/lib/hooks/useAuth';
import { collection, doc, setDoc } from '@firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link'
import { useRouter } from 'next/router';
import React from 'react'

const registerPage = () => {
    const router = useRouter();
    const isAuthenticated = useAuth();
    if (isAuthenticated) {
        router.push('/home');
    }

    const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let email = e.currentTarget.email.value;
        let password = e.currentTarget.password.value;
        let username = e.currentTarget.username.value;
        // console.log(email, password, username);

        createUserWithEmailAndPassword(auth, email, password)
        .then( async (userCredential) => {
            const user = userCredential.user;
            console.log(user);
            email = '';
            password = '';

            // Adds user data to Cloud Firestore database in "users" collection
            const data = {
                email: user.email,
                username: username,
            }
            await setDoc(doc(db, "users", user.uid), data);

            router.push('/home');
        })
        .catch((error) => {
            console.log(error.code, error.message);
        })
    }

  return (
    <div className="flex justify-center items-center min-h-screen bg-dc-900">
        <div className="absolute top-0 right-0 p-2">
            <ModeToggle />
        </div>
        <div className="flex flex-col bg-dc-700 min-w-96 text-center text-primary p-7 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-4">Create an account</h2>
            <form onSubmit={ handleSignUp }>
                <div className="text-left mb-2">
                    <label htmlFor="username" className="text-xs font-semibold">USERNAME</label>
                    <input type="username" id="username" className="min-w-full  bg-dc-900 p-2 rounded-md"></input>
                </div>
                <div className="text-left mb-2">
                    <label htmlFor="email" className="text-xs font-semibold">EMAIL</label>
                    <input id="email" className="min-w-full  bg-dc-900 p-2 rounded-md"></input>
                </div>
                <div className="text-left mb-8">
                    <label htmlFor="password" className="text-xs font-semibold">PASSWORD</label>
                    <input type="password" id="password" className="min-w-full  bg-dc-900 p-2 rounded-md"></input>
                </div>
                <Button className='font-bold min-w-full bg-dc-blurple text-white hover:bg-dc-blurple/70 mb-2'>Register</Button>
            </form>
            <div className="text-left text-sm">
                <Link href="/login" className="text-blue-500 hover:underline">Already have an account? Login</Link>
            </div>
        </div>
    </div>
  )
}

export default registerPage