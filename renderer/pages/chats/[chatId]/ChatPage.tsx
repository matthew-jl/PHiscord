import ChatMessage from '@/components/ChatMessage';
import ChatSidebar from '@/components/ChatSidebar';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { db, storage } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/hooks/useAuth';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from '@firebase/firestore';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { IoDocumentSharp, IoSearch, IoSend } from 'react-icons/io5';
import { MdEmojiEmotions } from 'react-icons/md';
import { RiAttachment2 } from 'react-icons/ri';
import { v4 } from 'uuid';

const ChatPage = () => {
  const user = useAuth();
  const router = useRouter();
  let { chatId } = router.query;
  chatId = Array.isArray(chatId) ? chatId[0] : chatId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState({
      type: null,
      file: null,
      url: '',
      uploadUrl: '',
      size: null,
  });
  const [targetUserData, setTargetUserData] = useState(null);
  const [blockExists, setBlockExists] = useState(false);
  const { toast } = useToast();

  const { theme } = useTheme();
  let emojiPickerTheme = Theme.AUTO;
  if (theme === 'dark') {
      emojiPickerTheme = Theme.DARK;
  } else {
      emojiPickerTheme = Theme.LIGHT;
  }
  
  useEffect(() => {
    const fetchTargetData = async () => {
        if (!user) return;
        setIsLoading(true);
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists()) {
            return null;
        }
        const chat = chatDoc.data();
        const otherUserId = chat.user1 === user.uid ? chat.user2 : chat.user1;
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        if (!otherUserDoc.exists()) return null;

        const otherUserData = otherUserDoc.data();
        let otherUserImageUrl = '';
        if (otherUserData.imageUrl) {
            otherUserImageUrl = await getDownloadURL(ref(storage, otherUserData.imageUrl));
        }
        setTargetUserData({
          uid: otherUserDoc.id,
          username: otherUserData.username,
          imageUrl: otherUserImageUrl,
        })

        if (otherUserData.blocks && otherUserData.blocks[user.uid]) {
            setBlockExists(true);
        }
        setIsLoading(false);
    };
    fetchTargetData();
}, [router, user]);

  useEffect(() => {
    const fetchCurrentUserName = async () => {
        if (!user) return;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            setCurrentUserName(userDoc.data().username);
        }
        
        if (!targetUserData) return;
        if (userDoc.data().blocks && userDoc.data().blocks[targetUserData.uid]) {
            setBlockExists(true);
        }
    };
    fetchCurrentUserName();
  }, [user, targetUserData]);
  
  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chatMessages', chatId), (doc) => {
        setChat(doc.data());
    });
    return () => {
        unSub();
    };
  }, [router]);

  const handleEmoji = (e) => {
      setText((prev) => prev + e.emoji);
  };

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const handleSearch = () => {
      if (!chat || !chat.messages) return;
      const results = chat.messages.filter(message => 
          message.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
  };

  const formatFileSize = (size) => {
      const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      let unitIndex = 0;
      let readableSize = size;

      while (readableSize >= 1024 && unitIndex < units.length - 1) {
          readableSize = parseFloat(readableSize) / 1024;
          unitIndex++;
      }
      readableSize = readableSize.toFixed(2) + ' ' + units[unitIndex];
      return readableSize;
  };

  const handleFile = (e) => {
      if (e.target.files[0]) {
          const fileType = e.target.files[0].type.startsWith('image/') ? 'image' : 'file';
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
              });
          }
      } else {
          console.log('file/image not found');
      }
  };

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
                  size: fileSize,
              });
          } else {
              setFile({
                  type: fileType,
                  file: droppedFile,
                  url: fileUrl,
                  uploadUrl: `chat-files/${droppedFile.name}`,
                  size: fileSize,
              });
          }
      }
  };

  const handleDragOver = (event) => {
      event.preventDefault();
  };

  useEffect(() => {
      return () => {
          setFile({
              type: null,
              file: null,
              url: '',
              uploadUrl: '',
              size: null,
          });
      };
  }, [router]);

  const handleSend = async () => {
    if (blockExists) {
        // toast to indicate block exists
        toast({
            title: "Cannot send message",
            description: "You blocked, or have been blocked, by the other user.",
            variant: 'destructive',
        })
        setText('');
        setFile({
            type: null,
            file: null,
            url: '',
            uploadUrl: '',
            size: null,
        });
        return;
    }
    if (text === '' && !file.file) return;
    try {
        if (file.file) {
            const fileRef = ref(storage, file.uploadUrl);
            await uploadBytes(fileRef, file.file).then(() => {
                console.log('file/image uploaded');
            });
        }

        await updateDoc(doc(db, 'chatMessages', chatId), {
            messages: arrayUnion({
                userId: user.uid,
                content: text,
                timestamp: new Date(),
                ...(file.uploadUrl !== '' && { [`${file.type}Url`]: file.uploadUrl }),
                ...(file.type === 'file' && { fileSize: file.size }),
            }),
        });

        await updateDoc(doc(db, 'chats', chatId), {
          timestamp: serverTimestamp(),
        })
        console.log('successfully added data to chatMessages');
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
        await updateDoc(doc(db, 'chatMessages', chatId), {
            messages: arrayRemove(message),
        });
        console.log('successfully deleted message');
    } catch (error) {
        console.log(error);
    }
};

const handleEdit = async (message, newContent) => {
    try {
        const chatDocRef = doc(db, 'chatMessages', chatId);
        const chatDoc = await getDoc(chatDocRef);
        const messages = chatDoc.data().messages;
        const newMessages = messages.map((msg) => {
            if (msg.timestamp.toMillis() === message.timestamp.toMillis()) {
                return { ...msg, content: newContent, isEdited: true };
            } else {
                return msg;
            }
        });

        await updateDoc(chatDocRef, {
            messages: newMessages,
        });
        console.log('successfully edited message');
    } catch (error) {
        console.log(error);
    }
};

  return (
    <>
      <Sidebar chatIsActive />
      {isLoading ? ( <Loading /> ) : (
        <div className="w-full h-screen flex pl-16 relative bg-red-900">
          <ChatSidebar />
          <div className="grow h-screen ml-60 bg-dc-700 flex flex-col">
              {/* Chat Header */}
              <div className='w-full min-h-12 shadow-md flex items-center text-sm text-left px-4'>
                <div className='bg-dc-900 rounded-full w-8 h-8 overflow-hidden'>
                    <img src={ targetUserData.imageUrl } alt={ targetUserData.uid } className='w-full h-full object-cover'/>
                </div>
                <p className='grow pl-4 font-semibold '>{ targetUserData.username }</p>
                {/* Search Bar */}
                <div className='relative ml-4 w-96'>
                        <Input 
                            placeholder='Search messages'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className='bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-8'
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size='icon' variant='blurple' onClick={handleSearch} className='absolute right-0 top-0 h-8 w-8'>
                                    <IoSearch />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-96 p-2 bg-dc-900' side='bottom' align='end'>
                            {searchResults.length > 0 ? (
                                searchResults.map((message, index) => (
                                    <ChatMessage 
                                        key={index}
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
                                    />
                                ))
                            ) : (
                                <p className='text-sm text-primary/80'>No results found</p>
                            )}
                        </PopoverContent>
                        </Popover>
                    </div>
              </div>
              {/* Content */}
              <ScrollArea className='h-full'>
                  <div className='flex flex-col space-y-6 h-[685px]'>
                    <div className='flex-1' />
                    {/* Content Header */}
                    <div className='space-y-2 px-4'>
                        <div className='bg-dc-900 rounded-full w-24 h-24 overflow-hidden'>
                            <img src={ targetUserData.imageUrl } alt={ targetUserData.uid } className='w-full h-full object-cover'/>
                        </div>
                        <p className='text-2xl font-bold'>{ targetUserData.username }</p>
                        <p className='text-sm text-primary/80'>This is the beginning of your direct message history with { targetUserData.username }.</p>
                    </div>
                    {/* Messages */}
                    <div className="space-y-2">
                        {chat &&
                            chat.messages &&
                            chat.messages.map((message) => (
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
                                />
                            ))}
                    </div>
                  </div>
              </ScrollArea>
              {/* Input */}
              <div className="w-full h-fit px-4 pb-4 pt-2 relative flex space-x-2">
                <Input
                    className="bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder={`Message @${targetUserData.username}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                />
                <Label htmlFor="imageInput" className="absolute right-28 bottom-6 cursor-pointer">
                    <RiAttachment2 size={24} />
                </Label>
                <Input type="file" id="imageInput" className="hidden" onChange={handleFile} />
                {file.file && (
                    <div className="absolute right-16 bottom-16 w-60 h-fit bg-dc-900 rounded-md p-2">
                        {file.type === 'image' && (
                            <>
                                <p className="text-xs">Image selected: {file.file.name}</p>
                                <div className="w-52 h-52 mx-auto my-2">
                                    <img src={file.url} alt={file.file.name} className="w-full h-full object-contain" />
                                </div>
                            </>
                        )}
                        {file.type === 'file' && (
                            <>
                                <p className="text-xs">File selected: {file.file.name}</p>
                                <div className="w-52 h-52 mx-auto my-2 flex flex-col justify-center items-center">
                                    <IoDocumentSharp size={60} />
                                    <p className="text-sm">{file.size}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger className="absolute right-20 bottom-6">
                        <MdEmojiEmotions size={24} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' side='top' sideOffset={5} alignOffset={-22} className="bg-transparent border-transparent shadow-none">
                        <EmojiPicker theme={emojiPickerTheme} onEmojiClick={handleEmoji} />
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button size="icon" variant="blurple" onClick={handleSend}>
                    <IoSend />
                </Button>
              </div>
          </div> 
        </div>
      )}
    </>
  )
}

export default ChatPage