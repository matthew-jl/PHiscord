import Link from 'next/link'
import React from 'react'
import { auth } from '../lib/firebaseConfig'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

const LoginPage = () => {

    const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let email = e.currentTarget.email.value;
        let password = e.currentTarget.password.value;

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential);
        })
        .catch((error) => {
            console.log(error);
        })
    }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col bg-gray-700 min-w-96 text-center text-white p-7 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-1">Welcome back!</h2>
            <p className="text-sm mb-4">We're so excited to see you again!</p>
            <form onSubmit={ handleSignIn }>
                <div className="text-left mb-2">
                    <label htmlFor="email" className="text-xs font-semibold">EMAIL</label>
                    <input id="email" className="min-w-full  bg-gray-900 p-2 rounded-md"></input>
                </div>
                <div className="text-left mb-8">
                    <label htmlFor="password" className="text-xs font-semibold">PASSWORD</label>
                    <input type="password" id="password" className="min-w-full  bg-gray-900 p-2 rounded-md"></input>
                </div>
                <button className="min-w-full bg-dcBlurple text-white p-2 rounded-md font-bold mb-2">Log In</button>
            </form>
            <div className="text-left text-sm">
                <Link href="/register" className="text-blue-400">Need an account? Register</Link>
            </div>
        </div>
    </div>
  )
}

export default LoginPage