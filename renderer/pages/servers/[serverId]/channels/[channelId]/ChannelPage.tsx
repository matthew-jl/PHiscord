import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import ServerPage from '../../ServerPage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebaseConfig';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from '@firebase/firestore';
import Loading from '@/components/Loading';
import { MdEmojiEmotions } from 'react-icons/md';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { IoSend } from 'react-icons/io5';
import { FaHashtag } from 'react-icons/fa';
import ChatMessage from '@/components/ChatMessage';
import { useAuth } from '@/lib/hooks/useAuth';

const ChannelPage = () => {
    const { theme } = useTheme();
    let emojiPickerTheme = Theme.AUTO;
    if (theme == 'dark') {
        emojiPickerTheme = Theme.DARK;
    } else {
        emojiPickerTheme = Theme.LIGHT;
    }

    const user = useAuth();
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
    console.log(chat)

    const scrollAreaRef = useRef(null);
    const scrollToBottom = () => {
        scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        scrollToBottom()
    }, [chat]);
    
    // append emoji to text when emoji is chosen
    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
    }
    
    const [text, setText] = useState('');
    const handleSend = async () => {
        if (text === '') return;
        try {
            await updateDoc(doc(db, 'channelMessages',channelId), {
                messages: arrayUnion({
                    userId: user.uid,
                    content: text,
                    timestamp: new Date(),
                })
            });
            console.log('successfully added data to channelMessages')
        } catch (error) {
            console.log(error);
        }
        setText('');
    };

    const handleDelete = async (message) => {
        try {
            await updateDoc(doc(db, 'channelMessages', channelId), {
                messages: arrayRemove(message),
            });
            console.log('successfully deleted message')
        } catch (error) {
            console.log(error);
        }
    };
    
    const handleEdit = async (message, newContent) => {
        try {
            const channelDocRef = doc(db, 'channelMessages', channelId);
            const channelDoc = await getDoc(channelDocRef);
            const messages = channelDoc.data().messages;
            const newMessages = messages.map((msg) => {
                if (msg.timestamp.toMillis() == message.timestamp.toMillis()) {
                    return {...msg, content: newContent, isEdited: true};
                } else {
                    return msg;
                }
            }
            );
      
            await updateDoc(channelDocRef, {
              messages: newMessages,
            });
            console.log('successfully edited message');
          } catch (error) {
            console.log(error);
          }
    };

  return (
    <ServerPage>
        { isLoading ? <Loading /> : (
            <div className="grow h-screen mx-60 bg-dc-700 flex flex-col">
                {/* Chat Header */}
                <div className='w-full min-h-12 shadow-md font-semibold flex items-center text-sm text-left px-4'>
                    <FaHashtag className='text-dc-500'/>
                    <div className='grow pl-2'>
                        { channelData.name }
                    </div>
                </div>
                {/* Content */}
                <ScrollArea className='h-full'>
                    <div className='flex flex-col space-y-6 h-[685px]'>
                        <div className='flex-1' />
                        <div className='space-y-2 px-4'>
                            <div className='bg-dc-900 rounded-full w-fit p-4'>
                                <FaHashtag size={40} />
                            </div>
                            <p className='text-2xl font-bold'>Welcome to #{ channelData.name }!</p>
                            <p className='text-sm text-primary/80'>This is the start of the #{ channelData.name } channel.</p>
                        </div>
                        <div className='space-y-2'>
                            {/* <ChatMessage username='test' content='wassup'/> */}
                            { chat && chat.messages.map((message) => (
                                <ChatMessage 
                                userId={message.userId} 
                                content={message.content} 
                                timestamp={message.timestamp} 
                                onDelete={() => handleDelete(message)}
                                onEdit={(newContent) => handleEdit(message, newContent)}
                                isEdited={message?.isEdited}
                                />
                            )) }
                        </div>
                        <div ref={scrollAreaRef}></div>
                    </div>
                </ScrollArea>
                {/* Chat Input */}
                <div className='w-full h-fit px-4 pb-4 pt-2 relative flex space-x-2'>
                    <Input 
                    className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0' 
                    placeholder={`Message #${ channelData.name }`} 
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
                    <Button size='icon' variant='blurple' onClick={ handleSend }>
                        <IoSend />
                    </Button>
                </div>
            </div>
        )}
    </ServerPage>
  )
}

export default ChannelPage