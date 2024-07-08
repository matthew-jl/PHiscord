import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useForm } from 'react-hook-form'
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useModal } from '@/lib/hooks/useModalStore'
import { db, storage } from '@/lib/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc } from '@firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'
import { v4 } from 'uuid'

// make a schema using zod for the form
const formSchema = z.object({
    name: z.string().min(1, {
        message: 'Server name is required.'
    }),
    image: z.any().optional(),
});

const EditServerModal = () => {
    const router = useRouter();
    let { serverId } = router.query;
    serverId = Array.isArray(serverId) ? serverId[0] : serverId;
    const user = useAuth();
    const [imageUpload, setImageUpload] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [serverData, setServerData] = useState(null);
    let imageUrl = null;

    const [originalImage, setOriginalImage] = useState(null);

    const uploadImage = async () => {
        if (imageUpload == null) {
            console.log('no image found')
            return;
        }
        imageUrl = `server-icons/${imageUpload.name + v4()}`;
        const imageRef = ref(storage, imageUrl);
        await uploadBytes(imageRef, imageUpload).then(() => {
            console.log('image uploaded.');
        })
    };

    const editServer = async (name, image) => {
        const serverRef = doc(db, "servers", serverId);
        const updateData: { name: string; imageUrl?: string } = { name: name };
        if (image) {
            updateData.imageUrl = image;
        }
        await updateDoc(serverRef, updateData);
    }

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "editServer";

    const handleClose = () => {
        form.reset();
        setImageUpload(null);
        setImagePreview(originalImage);
        onClose();
    }

    useEffect(() => {
        if (serverId) {
            const fetchServerData = async () => {
                const serverRef = doc(db, 'servers', serverId);
                const serverSnap = await getDoc(serverRef);
                if (serverSnap.exists()) {
                    const data = serverSnap.data();
                    setServerData(data);
                    if (data.imageUrl) {
                        const imageDownloadUrl = await getDownloadURL(ref(storage, data.imageUrl));
                        setImagePreview(imageDownloadUrl);
                        setOriginalImage(imageDownloadUrl);
                    }
                    form.reset({
                        name: data.name,
                    });
                }
            }
            fetchServerData();
        }
    }, [serverId]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            image: "",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        await uploadImage();

        const name = values.name;
        await editServer(name, imageUrl);

        alert('successfully edited server');

        handleClose();

        router.reload();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-dc-800'>
                <DialogHeader>
                    <DialogTitle className='text-center text-primary text-2xl'>Edit Your Server</DialogTitle>
                    <DialogDescription className='text-center text-dc-500'>
                        Change your server's name or icon.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-7'>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-center text-center w-24 h-24 m-auto rounded-full bg-dc-900 overflow-hidden'>
                                {imagePreview && (
                                    <img src={imagePreview} alt="Image Preview" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel className='text-xs font-semibold text-primary'>
                                            SERVER ICON
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='file'
                                                onChange={(event) => {
                                                    if (event.target.files && event.target.files[0]) {
                                                        setImageUpload(event.target.files[0]);
                                                        onChange(event.target.files);
                                                        console.log('File selected:', event.target.files[0]);
                                                        setImagePreview(URL.createObjectURL(event.target.files[0]));
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className='h-auto bg-dc-900 text-primary focus-visible:ring-0 focus-visible:ring-offset-0 file:px-4 file:py-1 file:text-white file:bg-dc-blurple file:rounded-3xl file:mr-6'
                                                {...fieldProps}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-xs font-semibold text-primary'>
                                            SERVER NAME
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                placeholder='Enter your server name'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500' />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button disabled={isLoading} variant='blurple'>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    )
}

export default EditServerModal
