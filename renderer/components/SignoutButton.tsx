import { auth } from '@/lib/firebaseConfig'
import { signOut } from 'firebase/auth'
import React from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/router'

const SignoutButton = () => {

    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    }

  return (
    <Button onClick={ handleSignOut }>
        Sign Out
    </Button>
  )
}

export default SignoutButton