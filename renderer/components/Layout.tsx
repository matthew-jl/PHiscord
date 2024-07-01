'use client';
import { useAuthWithLoading } from '@/lib/hooks/useAuth';
import Head from 'next/head'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import Loading from '@/components/Loading';

const Layout = ({ children }: { children: React.ReactElement }) => {

    // const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const { user, isLoading } = useAuthWithLoading();
  
  // So that non-logged-in user can access login and register page
  const noAuthRequired = ['/login', '/register'];
  const isAuthPage = noAuthRequired.includes(router.pathname);

  // workaround for next/router can't be used in server-side.
  // use effects are always client-side.
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isAuthPage) {
          router.push('/login');
      }
    }
  }, [user, isLoading, isAuthPage, router]);

  if (isLoading) {
    return (
      < Loading />
    )
  }

  if (user || isAuthPage) {
      return (
        <>
            <Head>
                <title>PHiscord</title>
            </Head>
            <div>{ children }</div>
        </>
      )
  } else {
    return (
      <Loading />
    ); // loading screen/spinner
  }
}

export default Layout