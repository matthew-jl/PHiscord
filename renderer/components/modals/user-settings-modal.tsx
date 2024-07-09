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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Label } from '../ui/label'
import { RiAttachment2 } from 'react-icons/ri'
import SignoutButton from '../SignoutButton'
import { HiPencil } from 'react-icons/hi2'
import { Separator } from '../ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { ModeToggle } from '../mode-toggle'

// make a schema using zod for the form
const formSchema = z.object({
    username: z.string().min(1, {
        message: 'Username is required.'
    }),
    profilePicture: z.any().optional(),
    customStatus: z.string().optional(),
});

const reauthSchema = z.object({
    currentPassword: z.string().min(1, {
        message: 'Current password is required.'
    }),
    newPassword: z.string().min(6, {
        message: 'New password must be at least 6 characters long.'
    }),
    confirmPassword: z.string().min(6, {
        message: 'Confirm password must be at least 6 characters long.'
    }),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const UserSettingsModal = () => {
    const user = useAuth();
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "userSettings";

    const router = useRouter();

    const [userData, setUserData] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
                const profilePictureUrl = await getDownloadURL(ref(storage, userDoc.data().imageUrl));
                setProfilePicture(profilePictureUrl);
            }
        }
        fetchUserData();
        form.reset({
            username: userData?.username,
            customStatus: userData?.customStatus,
        })
    }, [isOpen, user]);

    const handleClose = () => {
        setProfilePicture(null);
        form.reset();
        reauthForm.reset();
        onClose();
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            profilePicture: null,
            customStatus: "",
        }
    });
    const reauthForm = useForm({
        resolver: zodResolver(reauthSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    });
    const isLoading = form.formState.isSubmitting;
    const isReauthLoading = reauthForm.formState.isSubmitting;


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);

        const updates: any = {
            username: values.username,
            customStatus: values.customStatus,
        };

        if (values.profilePicture) {
            const uploadUrl = 'user-icons/' + values.profilePicture.name + v4();
            const profilePictureRef = ref(storage, uploadUrl);
            await uploadBytes(profilePictureRef, values.profilePicture);
            updates.imageUrl = uploadUrl;
        }

        await updateDoc(doc(db, 'users', user.uid), updates);

        alert('Successfully updated user information');

        handleClose();

        router.reload();
    }

    const reauthOnSubmit = async (values: z.infer<typeof reauthSchema>) => {
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, values.newPassword);

            alert('Password updated successfully');
            handleClose();
            router.reload();
        } catch (error) {
            console.error("Reauthentication failed: ", error);
            alert('Reauthentication failed. Please try again.');
            reauthForm.reset();
        }
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePicture(URL.createObjectURL(e.target.files[0]));
            form.setValue('profilePicture', e.target.files[0]);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent className='bg-dc-700 max-w-full h-screen'>
                <Tabs defaultValue="general">
                    <p className='uppercase text-sm font-semibold mb-2'>User Settings</p>
                    <TabsList>
                        <TabsTrigger value='general'>General</TabsTrigger>
                        <TabsTrigger value='appearance'>Appearance</TabsTrigger>
                        <TabsTrigger value='overlay'>Overlay</TabsTrigger>
                        <TabsTrigger value='privacy'>Privacy</TabsTrigger>
                    </TabsList>
                    <TabsContent value='general' className='h-fit'>
                        <div className='bg-dc-800 w-full h-full rounded-lg p-4'>
                        {userData && (
                            <>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-7'>
                                        <div className='space-y-2'>
                                            <div className='flex items-center space-x-4'>
                                                <div className='w-20 h-20 rounded-full overflow-hidden flex items-center'>
                                                    <img
                                                        src={profilePicture}
                                                        alt="Profile"
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                                <Label htmlFor='profilePicture' className='cursor-pointer flex items-center rounded-md p-2 hover:bg-dc-700'>
                                                    <HiPencil size={20} />
                                                    <span className='ml-2'>Change Image</span>
                                                </Label>
                                                <Input
                                                    id='profilePicture'
                                                    type='file'
                                                    className='hidden'
                                                    onChange={handleProfilePictureChange}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                            Username
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                disabled={isLoading}
                                                                className='bg-dc-900 text-primary placeholder:text-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                                placeholder='Enter your username'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className='text-red-500' />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormItem>
                                                <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                    Email
                                                </FormLabel>
                                                <Input
                                                    disabled
                                                    value={userData.email}
                                                    className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                />
                                            </FormItem>
                                            <FormField
                                                control={form.control}
                                                name="customStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                            custom status
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                disabled={isLoading}
                                                                className='bg-dc-900 text-primary placeholder:text-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                                placeholder='Enter your custom status (leave blank for empty)'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className='text-red-500' />
                                                    </FormItem>
                                                )}
                                            />
                                            <div>
                                                <Button disabled={isLoading} variant='blurple' className='mt-2'>
                                                        Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                                <Separator className='h-[1px] bg-primary/20 my-4'/>
                                <div className='space-y-2 mt-2'>
                                    <p className='text-xs font-semibold text-primary uppercase'>Password</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='blurple'>
                                                Edit Password
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent side='right'>
                                            <Form {...reauthForm}>
                                                <form onSubmit={reauthForm.handleSubmit(reauthOnSubmit)} className='space-y-4'>
                                                    <FormField
                                                        control={reauthForm.control}
                                                        name="currentPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                                    Current Password
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type='password'
                                                                        disabled={isReauthLoading}
                                                                        className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                                        placeholder='Enter current password'
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className='text-red-500' />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={reauthForm.control}
                                                        name="newPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                                    New Password
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type='password'
                                                                        disabled={isReauthLoading}
                                                                        className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                                        placeholder='Enter new password'
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className='text-red-500' />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                            control={reauthForm.control}
                                                            name="confirmPassword"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs font-semibold text-primary uppercase'>
                                                                        Confirm Password
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type='password'
                                                                            disabled={isReauthLoading}
                                                                            className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                                            placeholder='Confirm new password'
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className='text-red-500' />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    <div className='mt-2 flex justify-end'>
                                                        <Button disabled={isReauthLoading} variant='blurple'>
                                                            Save Password
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </PopoverContent>

                                    </Popover>
                                </div>
                                <Separator className='h-[1px] bg-primary/20 my-4'/>
                                <div className='mt-2'>
                                    <SignoutButton />
                                </div>
                            </>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value='appearance' className='h-fit'>
                        <div className='bg-dc-800 w-full h-full rounded-lg p-4'>
                            <p className='text-xs font-semibold text-primary uppercase'>Change Theme</p>
                            <ModeToggle />
                        </div>
                    </TabsContent>
                    <TabsContent value='overlay' className='h-fit'>
                        <div className='bg-dc-800 w-full h-full rounded-lg p-4'>OVerlay</div>
                    </TabsContent>
                    <TabsContent value='privacy' className='h-fit'>
                        <div className='bg-dc-800 w-full h-full rounded-lg p-4'>privacy</div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>

    )
}

export default UserSettingsModal
