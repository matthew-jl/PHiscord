import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Layout from "@/components/Layout";

import { Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { useTheme } from "next-themes";

const font = Open_Sans({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <main className={font.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <FontSizeProvider>
              <ModalProvider />
              <Component {...pageProps} />
              <Toaster />
            </FontSizeProvider>
          </ThemeProvider>
        </main>
      </Layout>
    </>
  );
}

export default MyApp;
