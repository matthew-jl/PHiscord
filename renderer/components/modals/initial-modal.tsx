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
import { storage } from '@/lib/firebaseConfig'
import { ref, uploadBytes } from 'firebase/storage'
import { v4 } from 'uuid'

// make a schema using zod for the form
const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Server name is required.'
  }),
  imageUrl: z.string().min(1, {
    message: 'Server image is required.'
  })
});

const InitialModal = () => {
  // upload image to firebase storage with randomized name
  const [imageUpload, setImageUpload] = useState(null);
  const uploadImage = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `server-icons/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then(() => {
      // after uploading, run this
      alert('image uploaded.')
    })
  };

  // useModalStore hook
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "createServer";

  const handleClose = () => {
    form.reset();
    onClose();
  }

  // Make form using zod schema from above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    }
  });

  const isLoading = form.formState.isSubmitting;
  // run this when submitting the form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    uploadImage();
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
                    TODO: DISPLAY CHOSEN IMAGE
                  </div>
                  <FormField 
                    control={form.control}
                    name="imageUrl"
                    render={({ field: {value, onChange, ...fieldProps } }) => (
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
                                // console.log('File selected:', event.target.files[0]);
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