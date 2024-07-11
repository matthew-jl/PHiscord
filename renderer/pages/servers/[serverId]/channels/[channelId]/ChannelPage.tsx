import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import ServerPage from '../../ServerPage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { db, storage } from '@/lib/firebaseConfig';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from '@firebase/firestore';
import Loading from '@/components/Loading';
import { MdEmojiEmotions } from 'react-icons/md';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { IoDocumentSharp, IoSend } from 'react-icons/io5';
import { FaHashtag } from 'react-icons/fa';
import ChatMessage from '@/components/ChatMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { v4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { RiAttachment2 } from 'react-icons/ri';
import { ref, uploadBytes } from 'firebase/storage';
import { HiMiniSpeakerWave } from 'react-icons/hi2';
import MediaRoom from '@/components/MediaRoom';

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

    const [currentUserName, setCurrentUserName] = useState(null);
    useEffect(() => {
        const fetchCurrentUserData = async () => {
            if (!user || !serverId) return;
            const serverMemberDoc = await getDoc(doc(db, 'serverMembers', serverId));
            if (serverMemberDoc.exists()) {
                if (serverMemberDoc.data()[user.uid].nickname && serverMemberDoc.data()[user.uid].nickname !== '') {
                    setCurrentUserName(serverMemberDoc.data()[user.uid].nickname);
                } else {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    setCurrentUserName(userDoc.data().username);
                }
            }
        }
        fetchCurrentUserData();
    }, [user])

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
    }, [router]);

    // Read chat real-time
    const [chat, setChat] = useState(null);
    useEffect(() => {
        if (!channelData) return;
        else if (channelData.type !== 'text') return;
        const unSub = onSnapshot(doc(db, 'channelMessages', channelId), (doc) => {
            setChat(doc.data());
        });
        return () => {
            unSub();
        };
    }, [router, channelData]);

    // TODO: Scroll to bottom automatically
    // const scrollAreaRef = useRef(null);
    // const scrollToBottom = () => {
    //     scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" })
    // }
    // useEffect(() => {
    //     scrollToBottom()
    // }, [chat]);
    
    // append emoji to text when emoji is chosen
    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
    }
    
    // to convert file size to have formats
    const formatFileSize = (size) => {
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let readableSize = size;
    
        while (readableSize >= 1024 && unitIndex < units.length - 1) {
            readableSize = parseFloat(readableSize) / 1024;
            unitIndex++;
        }
        // round up to 2 decimals and add the format to the end
        readableSize = readableSize.toFixed(2) + ' ' + units[unitIndex];
        console.log(readableSize);
    
        return readableSize;
    };

    const [text, setText] = useState('');
    const [file, setFile] = useState({
        type: null, // can be image or file
        file: null,
        url: "",
        uploadUrl: "",
        size: null,
    });
    const handleFile = (e) => {
        if (e.target.files[0]) {
            const fileType = e.target.files[0].type.startsWith('image/') ? 'image' : 'file';
            console.log(e.target.files[0].size);
            const fileSize = formatFileSize(e.target.files[0].size);
            if (fileType === 'image') {
                setFile({
                    type: fileType,
                    file: e.target.files[0],
                    url: URL.createObjectURL(e.target.files[0]),
                    uploadUrl: `chat-images/${e.target.files[0].name + v4()}`,
                    size: fileSize,
                });
            } else {
                setFile({
                    type: fileType,
                    file: e.target.files[0],
                    url: URL.createObjectURL(e.target.files[0]),
                    uploadUrl: `chat-files/${e.target.files[0].name}`,
                    size: fileSize,
                })
            }
        } else {
            console.log('file/image not found');
        }
    }

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            const fileUrl = URL.createObjectURL(droppedFile);
            const fileType = droppedFile.type.startsWith('image') ? 'image' : 'file';
            const fileSize = formatFileSize(droppedFile.size);
            if (fileType === 'image') {
                setFile({ 
                    file: droppedFile, 
                    type: fileType, 
                    url: fileUrl, 
                    uploadUrl: `chat-images/${droppedFile.name + v4()}`,
                    size: fileSize 
                });
            } else {
                setFile({
                    type: fileType,
                    file: droppedFile,
                    url: fileUrl,
                    uploadUrl: `chat-files/${droppedFile.name}`,
                    size: fileSize,
                })
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        return () => {
            setText('');
            setFile({
                type: null,
                file: null,
                url: "",
                uploadUrl: "",
                size: null,
            })
        };
    }, [router]);

    const handleSend = async () => {
        if (text === '' && !file.file) return;
        try {
            if (file.file) {
                const fileRef = ref(storage, file.uploadUrl);
                await uploadBytes(fileRef, file.file).then(() => {
                    console.log('file/image uploaded');
                })
            }

            await updateDoc(doc(db, 'channelMessages',channelId), {
                messages: arrayUnion({
                    userId: user.uid,
                    content: text,
                    timestamp: new Date(),
                    ...(file.uploadUrl != "" && { [`${file.type}Url`]: file.uploadUrl }), // either imageType or fileType
                    ...(file.type === 'file' && { fileSize: file.size }),
                })
            });
            console.log('successfully added data to channelMessages')
        } catch (error) {
            console.log(error);
        }
        setText('');
        setFile({
            type: null,
            file: null,
            url: '',
            uploadUrl: '',
            size: null,
        });
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
                    { channelData.type === 'text' && (
                        <FaHashtag className='text-dc-500'/>
                    )}
                    { channelData.type === 'voice' && (
                        <HiMiniSpeakerWave className='text-dc-500' />
                    )}
                    <div className='grow pl-2'>
                        { channelData.name }
                    </div>
                </div>
                {/* Content */}
                {/* Text Channel */}
                { channelData.type === 'text' && (
                <>
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
                                { chat && chat.messages && chat.messages.map((message) => (
                                    <ChatMessage 
                                    key={message.timestamp}
                                    userId={message.userId} 
                                    content={message.content} 
                                    timestamp={message.timestamp} 
                                    onDelete={() => handleDelete(message)}
                                    onEdit={(newContent) => handleEdit(message, newContent)}
                                    isEdited={message?.isEdited}
                                    imageUrl={message?.imageUrl}
                                    fileUrl={message?.fileUrl}
                                    fileSize={message?.fileSize}
                                    currentUserName={currentUserName}
                                    currentServerId={serverId}
                                    />
                                )) }
                            </div>
                            {/* <div ref={scrollAreaRef}></div> */}
                        </div>
                    </ScrollArea>
                    {/* Chat Input */}
                    <div className='w-full h-fit px-4 pb-4 pt-2 relative flex space-x-2'>
                        {/* Main Input */}
                        <Input 
                        className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0' 
                        placeholder={`Message #${ channelData.name }`} 
                        value={ text }
                        onChange={ e => setText(e.target.value) }
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        />
                        {/* Image Attachment */}
                        <Label htmlFor='imageInput' className='absolute right-28 bottom-6 cursor-pointer'>
                            <RiAttachment2 size={24}/>
                        </Label>
                        <Input
                            type='file'
                            id='imageInput'
                            className='hidden'
                            onChange={handleFile}
                        />
                        { file.file && (
                            <div className='absolute right-16 bottom-16 w-60 h-fit bg-dc-900 rounded-md p-2 '>
                                { file.type === 'image' && (
                                    <>
                                        <p className='text-xs'>Image selected: { file.file.name }</p>
                                        <div className='w-52 h-52 mx-auto my-2'>
                                            <img src={ file.url } alt={ file.file.name } className='w-full h-full object-contain'/>
                                        </div>
                                    </>
                                )}
                                { file.type === 'file' && (
                                    <>
                                        <p className='text-xs'>File selected: { file.file.name }</p>
                                        <div className='w-52 h-52 mx-auto my-2 flex flex-col justify-center items-center'>
                                            <IoDocumentSharp size={60}/>
                                            <p className='text-sm'>{ file.size }</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {/* Emoji Picker */}
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
                </>
                )}
                {/* Voice Channel */}
                { channelData.type === 'voice' && (
                    <div className='w-full h-full'>
                        <MediaRoom 
                            chatId={channelId}
                            audio={true}
                            video={false}
                        />
                    </div>
                )}
            </div>
        )}
    </ServerPage>
  )
}

export default ChannelPage