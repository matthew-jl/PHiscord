import React from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Layout from '@/components/Layout'

import { Open_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ModalProvider } from '@/components/providers/modal-provider'

const font = Open_Sans({ subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
        <Layout>
          <main className={font.className}>
            <ThemeProvider attribute="class" defaultTheme='dark' enableSystem={false} storageKey='discord-theme'>
                  <ModalProvider />
                  <Component {...pageProps} />
            </ThemeProvider>
          </main>
        </Layout>
    </>
  )

}

export default MyApp
