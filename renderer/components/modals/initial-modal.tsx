import React, { useState } from 'react'
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
  FormDescription,
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
import { ref, uploadBytes } from 'firebase/storage'
import { v4 } from 'uuid'
import { Timestamp, doc, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'

// make a schema using zod for the form
const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Server name is required.'
  }),
  image: z.any().refine((files) => files?.length == 1, "Server icon is required."),
});

const InitialModal = () => {
  const router = useRouter();
  const user = useAuth();
  // upload image to firebase storage with randomized name
  const [imageUpload, setImageUpload] = useState(null);
  // const [imageUrl, setImageUrl] = useState(null);
  let imageUrl = null;

  // for previewing the server icon
  const [imagePreview, setImagePreview] = useState(null);

  const uploadImage = async () => {
    if (imageUpload == null) {
      console.log('no image found')
      return;
    }
    imageUrl = `server-icons/${imageUpload.name + v4()}`;
    const imageRef = ref(storage, imageUrl);
    await uploadBytes(imageRef, imageUpload).then(() => {
      // after uploading, run this
      console.log('image uploaded.');
    })
  };

  const createServer = async (id, name, image) => {
    // 'servers' collection
    const dataServers = {
      imageUrl: image,
      inviteCode: v4(),
      name: name,
    };
    await setDoc(doc(db, "servers", id), dataServers);

    // 'serverMembers' collection
    const dataServerMembers = {
      [user.uid]: {
        joined: true,
        joinedAt: serverTimestamp(),
        role: 'owner',
      }
    };
    await setDoc(doc(db, "serverMembers", id), dataServerMembers);

    // 'users' collection
    await updateDoc(doc(db, "users", user.uid), {
      [`servers.${id}`]: true
    });

    // 'channels' collection
    // default general text channel and voice channel
    let channelIdText = 'channel' + v4();
    let channelIdVoice = 'channel' + v4();
    const dataChannelsText = {
        name: 'general',
        server: id,
        lastMessageTimestamp: null,
        type: 'text',
    }
    const dataChannelsVoice = {
        name: 'General',
        server: id,
        lastMessageTimestamp: null,
        type: 'voice',
    }
    await setDoc(doc(db, 'channels', channelIdText), dataChannelsText);
    await setDoc(doc(db, 'channels', channelIdVoice), dataChannelsVoice);

    // 'serverChannels' collection
    const dataServerChannels = {
      [channelIdText]: true,
      [channelIdVoice]: true,
    }
    await setDoc(doc(db, 'serverChannels', id), dataServerChannels);

    // 'channelMessages' collection for text channel (set empty)
    await setDoc(doc(db, 'channelMessages', channelIdText), {});

  }

  // useModalStore hook
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "createServer";

  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  }

  // Make form using zod schema from above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: "",
    }
  });

  const isLoading = form.formState.isSubmitting;
  // run this when submitting the form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    await uploadImage();

    const id = "server" + v4();
    const name = values.name;
    await createServer(id, name, imageUrl);

    alert('successfully created server');
    
    handleClose();

    router.reload();
  }

  return (
    <Dialog open={ isModalOpen } onOpenChange={ handleClose }>
        <DialogContent className='bg-dc-800'>
            <DialogHeader>
            <DialogTitle className='text-center text-primary text-2xl'>Customize Your Server</DialogTitle>
            <DialogDescription className='text-center text-dc-500'>
                Give your new server a personality with a name and an icon. You can always change it later.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={ form.handleSubmit(onSubmit) } className='space-y-7'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-center text-center'>
                    {/* DISPLAY CHOSEN IMAGE */}
                    {imagePreview && (
                      <img src={imagePreview} alt="imagePreview" className='w-24 h-24 rounded-full' />
                    )}
                  </div>
                  <FormField 
                    control={form.control}
                    name="image"
                    render={({ field: {value, onChange, ...fieldProps} }) => (
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
                        <FormMessage className='text-red-500'/>
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
                        <FormMessage className='text-red-500'/>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button disabled={isLoading} variant='blurple'>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
        </DialogContent>
    </Dialog>

  )
}

export default InitialModal