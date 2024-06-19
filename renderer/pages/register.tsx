import { auth } from '@/lib/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link'
import React from 'react'

const registerPage = () => {

    const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let email = e.currentTarget.email.value;
        let password = e.currentTarget.password.value;

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            console.log(error.code, error.message);
        })
    }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col bg-gray-700 min-w-96 text-center text-white p-7 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-4">Create an account</h2>
            <form onSubmit={ handleSignUp }>
                <div className="text-left mb-2">
                    <label htmlFor="email" className="text-xs font-semibold">EMAIL</label>
                    <input id="email" className="min-w-full  bg-gray-900 p-2 rounded-md"></input>
                </div>
                <div className="text-left mb-8">
                    <label htmlFor="password" className="text-xs font-semibold">PASSWORD</label>
                    <input type="password" id="password" className="min-w-full  bg-gray-900 p-2 rounded-md"></input>
                </div>
                <button className="min-w-full bg-dcBlurple text-white p-2 rounded-md font-bold mb-2">Register</button>
            </form>
            <div className="text-left text-sm">
                <Link href="/login" className="text-blue-400">Already have an account? Login</Link>
            </div>
        </div>
    </div>
  )
}

export default registerPage