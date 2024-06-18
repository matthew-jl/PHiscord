import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

import Sidebar from "@/components/Sidebar";

export default function HomePage() {
    return (
        <React.Fragment>
            <Sidebar />
            
            <div className="mt-1 w-full flex justify-center">
                <Link href="/next" className={buttonVariants()}>
                    Go to next page
                </Link>
                <Link href="/login" className={buttonVariants()}>
                    Go to login page
                </Link>
            </div>
        </React.Fragment>
    );
}
