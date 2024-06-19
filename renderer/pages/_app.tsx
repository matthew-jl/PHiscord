import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import useAuth from '@/lib/hooks/useAuth';
import LoginPage from './login';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';

function MyApp({ Component, pageProps }: AppProps) {

  // const router = useRouter();
  // const isAuthenticated = useAuth();
  
  // // So that non-logged-in user can access login and register page
  // const noAuthRequired = ['/login', '/register'];
  // const isAuthPage = noAuthRequired.includes(router.pathname);

  // if (isAuthenticated || isAuthPage) {
  //   return (
  //     <>
  //       <Head>
  //         <title>PHiscord</title>
  //       </Head>
  //     <Component {...pageProps} />
  //     </>
  //   )
  // } else {
  //   return (
  //     <LoginPage />
  //   )
  // }

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )

}

export default MyApp
