import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { auth } from '../lib/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'

const LoginPage = () => {

    const isAuthenticated = useAuth();
    const router = useRouter();
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {

    // })

    if (isAuthenticated) {
        router.push('/home');
    }

    const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let email = e.currentTarget.email.value;
        let password = e.currentTarget.password.value;

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential);
            email = '';
            password = '';
            router.push('/home');
        })
        .catch((error) => {
            console.log(error);
        })
    }

// TODO: make error/validation messages in login and register
  return (
    <div className="flex justify-center items-center min-h-screen bg-dc-900">
        <div className="absolute top-0 right-0 p-2">
            <ModeToggle />
        </div>
        <Link href="/home">Go to home</Link>
        <div className="flex flex-col bg-dc-700 min-w-96 text-center text-primary p-7 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-1">Welcome back!</h2>
            <p className="text-sm mb-4">We're so excited to see you again!</p>
            <form onSubmit={ handleSignIn }>
                <div className="text-left mb-2">
                    <label htmlFor="email" className="text-xs font-semibold">EMAIL</label>
                    <input id="email" className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:outline-0"></input>
                </div>
                <div className="text-left mb-8">
                    <label htmlFor="password" className="text-xs font-semibold">PASSWORD</label>
                    <input type="password" id="password" className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:outline-0"></input>
                </div>
                <Button className='font-bold min-w-full bg-dc-blurple text-white hover:bg-dc-blurple/70 mb-2'>Log In</Button>
                {/* <button className="min-w-full bg-dcBlurple text-white p-2 rounded-md font-bold mb-2">Log In</button> */}
            </form>
            <div className="text-left text-sm">
                <Link href="/register" className="text-blue-500 hover:underline">Need an account? Register</Link>
            </div>
        </div>
    </div>
  )
}

export default LoginPage