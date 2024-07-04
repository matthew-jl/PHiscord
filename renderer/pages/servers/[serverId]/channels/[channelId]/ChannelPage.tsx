import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import ServerPage from '../../ServerPage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc } from '@firebase/firestore';
import Loading from '@/components/Loading';
import { MdEmojiEmotions } from 'react-icons/md';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { IoSend } from 'react-icons/io5';

const ChannelPage = () => {
    const { theme } = useTheme();
    let emojiPickerTheme = Theme.AUTO;
    if (theme == 'dark') {
        emojiPickerTheme = Theme.DARK;
    } else {
        emojiPickerTheme = Theme.LIGHT;
    }

    const router = useRouter();
    let { serverId, channelId } = router.query;
    serverId = Array.isArray(serverId) ? serverId[0] : serverId;
    channelId = Array.isArray(channelId) ? channelId[0] : channelId;

    const [isLoading, setIsLoading] = useState(true);
    const [channelData, setChannelData] = useState(null);
    useEffect(() => {
        const fetchChannelData = async () => {
            setIsLoading(true);
            const channelDoc = await getDoc(doc(db, 'channels', channelId));
            if (channelDoc.exists()) {
                setChannelData(channelDoc.data());
            }

            setIsLoading(false);
        };
        fetchChannelData();
    }, [])

    // Read chat real-time
    const [chat, setChat] = useState(null);
    useEffect(() => {
        const unSub = onSnapshot(doc(db, 'channelMessages', channelId), (doc) => {
            setChat(doc.data());
        });
        return () => {
            unSub();
        };
    }, []);

    // set chat when emoji is added
    const handleEmoji = (e) => {
        setText((prev) => prev+e.emoji);
    }

    const [text, setText] = useState('');
    const handleSend = async () => {
        if (text === '') return;
        try {
            await updateDoc(doc(db, 'channelMessages',channelId), {
            // ganti messages di db jadi array? 
            })
        } catch (error) {
            console.log(error);
        }
    };

  return (
    <ServerPage>
        { isLoading ? <Loading /> : (
            <div className="grow h-screen mx-60 bg-dc-700 flex flex-col">
                <div className='w-full min-h-12 shadow-md font-semibold flex items-center text-sm text-left'>
                    <div className='grow pl-4'>{ channelData.name }</div>
                </div>
                <ScrollArea className='h-full'>
                    <div className='flex flex-col space-y-20'>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder</p>
                        <p>placeholder2</p>
                    </div>
                </ScrollArea>
                <div className='w-full h-fit px-4 pb-4 pt-2 relative flex space-x-2'>
                    <Input 
                    className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0' 
                    placeholder='Message here...' 
                    value={ text }
                    onChange={ e => setText(e.target.value) }
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger className='absolute right-20 bottom-6'>
                            <MdEmojiEmotions size={24} className='' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side='top' className='bg-transparent border-transparent shadow-none'>
                            <EmojiPicker theme={ emojiPickerTheme } onEmojiClick={ handleEmoji }/>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size='icon' variant='blurple'>
                        <IoSend />
                    </Button>
                </div>
            </div>
        )}
    </ServerPage>
  )
}

export default ChannelPage