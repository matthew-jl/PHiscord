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
        router.reload();
    }

  return (
    <Button onClick={ handleSignOut } variant='destructive'>
        Sign Out
    </Button>
  )
}

export default SignoutButton