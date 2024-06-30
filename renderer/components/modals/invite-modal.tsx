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
import { Input } from "@/components/ui/input"
import { TbCopy } from "react-icons/tb";
import { TbCopyCheck } from "react-icons/tb";

import { useModal } from '@/lib/hooks/useModalStore'
import useAuth from '@/lib/hooks/useAuth'
import { Label } from '../ui/label'
import useOrigin from '@/lib/hooks/useOrigin';

const InviteModal = () => {
  const user = useAuth();

  // useModalStore hook
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "invite";
  
  // invite code from data passed to modal
  const { inviteCode }  = data;

  // hook to read current window URL
  const origin = useOrigin();
  const inviteUrl = `${origin}/invite/${ inviteCode }/InviteCodePage`

  // copy to clipboard useState
  const [copied, setCopied] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  return (
    <Dialog open={ isModalOpen } onOpenChange={ onClose }>
        <DialogContent className='bg-dc-800'>
            <DialogHeader className='mb-4'>
              <DialogTitle className='text-center text-primary text-2xl'>Invite Friends</DialogTitle>
              <DialogDescription className='text-center text-dc-500'>
                  Send an invite link to your friends. It's better together!
              </DialogDescription>
            </DialogHeader>
            <Label className='text-xs font-semibold uppercase'>
              Server Invite Link
            </Label>
            <div className='flex space-x-2'>
              <Input 
                className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0'
                value={ inviteUrl }
              />
              
                {copied ? 
                  (
                  <Button size='icon' className='bg-dc-green hover:bg-dc-green/80 text-white' onClick={ onCopy }>
                  <TbCopyCheck  size={20}/>
                  </Button>
                  ) : 
                  (
                  <Button size='icon' variant='blurple' onClick={ onCopy }>
                  <TbCopy  size={20}/>
                  </Button>
                  )
                  }
              
            </div>
            {/* <Button className='text-sm'>
              Generate a new invite link
            </Button> */}
        </DialogContent>
    </Dialog>

  )
}

export default InviteModal