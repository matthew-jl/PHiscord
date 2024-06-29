import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { storage } from "@/lib/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

export default function NextPage() {
    const imageRef = ref(storage, 'server-icons/puddle art.jpga8edb9f7-0b69-4cfc-b30c-933204eb987f');
    getDownloadURL(imageRef).then((url) => {
        // Insert url into an <img> tag to "download"
        document.getElementById('test').setAttribute('src', url);
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
    
          // ...
    
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
    });

    return (
        <React.Fragment>
            {/* <Head>
                <title>Next - Nextron (with-tailwindcss)</title>
            </Head> */}
            <div className="mt-1 w-full flex-wrap flex justify-center">
                <Link href="/home" className={buttonVariants()}>
                    Go to home page
                </Link>
                <Image id='test' src='\images\discord-logo.webp' alt='test' width={100} height={100} />
            </div>
        </React.Fragment>
    );
}
