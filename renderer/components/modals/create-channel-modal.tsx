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
import { doc, updateDoc, getDoc, setDoc } from '@firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'
import { v4 } from 'uuid'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { FaHashtag } from 'react-icons/fa'
import { HiMiniSpeakerWave } from 'react-icons/hi2'

// make a schema using zod for the form
const formSchema = z.object({
    name: z.string().min(1, {
        message: 'Channel name is required.'
    }),
    type: z.enum(['text', 'voice'], {
        required_error: 'Channel type is required.'
    }),
});

const CreateChannelModal = () => {
    const router = useRouter();
    let { serverId } = router.query;
    serverId = Array.isArray(serverId) ? serverId[0] : serverId;
    const user = useAuth();
    const [newChannelId, setNewChannelId] = useState(null);

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "createChannel";

    const handleClose = () => {
        form.reset();
        onClose();
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: 'text',
        }
    });

    const createChannel = async (name, type) => {
        // channels
        const channelId = 'channel' + v4();
        setNewChannelId(channelId);

        const dataChannel = {
            name: name,
            server: serverId,
            lastMessageTimestamp: null,
            type: type,
        }
        await setDoc(doc(db, 'channels', channelId), dataChannel);

        // 'channelMessages' collection if text channel (set empty)
        if (type === 'text') {
            await setDoc(doc(db, 'channelMessages', channelId), {});
        }

        // serverChannels
        await updateDoc(doc(db, 'serverChannels', serverId), {
            [channelId]: true,
        })
    }

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        const name = values.name;
        const type = values.type;
        createChannel(name, type);
        
        alert('successfully created a channel');
        handleClose();
        router.reload();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-dc-800'>
                <DialogHeader>
                    <DialogTitle className='text-center text-primary text-2xl'>Create Channel</DialogTitle>
                    <DialogDescription className='text-center text-dc-500'>
                        Create a text or voice channel for your server!
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-7'>
                        <div className='space-y-2'>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-xs font-semibold text-primary'>
                                            CHANNEL TYPE
                                        </FormLabel>
                                        <RadioGroup defaultValue='text'>
                                            <div className='flex flex-col space-y-2'>
                                                <Label htmlFor='radio-text'>
                                                    <div className='bg-dc-900 py-4 px-3 flex rounded-md hover:bg-dc-900/50'>
                                                        <FaHashtag className='text-dc-500 opacity-50 mr-2'/>
                                                        <span>Text</span>
                                                        <RadioGroupItem value='text' id='radio-text' className='ml-auto'/>
                                                    </div>
                                                </Label>
                                                <Label htmlFor='radio-voice'>
                                                    <div className='bg-dc-900 py-4 px-3 flex rounded-md hover:bg-dc-900/50'>
                                                        <HiMiniSpeakerWave className='text-dc-500 opacity-50 mr-2' />
                                                        <span>Voice</span>
                                                        <RadioGroupItem value='voice' id='radio-voice' className='ml-auto'/>
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>
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
                                            CHANNEL NAME
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className='bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                placeholder='Enter your channel name'
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
                                Create Channel
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    )
}

export default CreateChannelModal
