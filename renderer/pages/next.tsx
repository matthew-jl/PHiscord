import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export default function NextPage() {
    return (
        <React.Fragment>
            {/* <Head>
                <title>Next - Nextron (with-tailwindcss)</title>
            </Head> */}
            <div className="mt-1 w-full flex-wrap flex justify-center">
                <Link href="/home" className={buttonVariants()}>
                    Go to home page
                </Link>
            </div>
        </React.Fragment>
    );
}
