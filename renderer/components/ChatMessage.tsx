import { db, storage } from '@/lib/firebaseConfig';
import { doc, getDoc, Timestamp } from '@firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { Button } from './ui/button';
import { MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import { Input } from './ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import DOMPurify from 'dompurify';
import { ipcRenderer } from 'electron';
import { IoDocumentSharp } from 'react-icons/io5';
import { IoMdDownload } from 'react-icons/io';

import {
	RegExpMatcher,
	TextCensor,
	asteriskCensorStrategy,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const censor = new TextCensor().setStrategy(asteriskCensorStrategy());

type chatMessageProps = {
    userId: string;
    content: string;
    timestamp: Timestamp;
    onDelete: () => void;
    onEdit: (newContent: string) => void;
    isEdited?: boolean;
    imageUrl?: string;
    fileUrl?: string;
    fileSize?: string;
    currentUserName?: string;
    currentServerId?: string;
}

const ChatMessage = ({ userId, content, timestamp, onDelete, onEdit, isEdited, imageUrl, fileUrl, fileSize, currentUserName, currentServerId }: chatMessageProps) => {
    const user = useAuth();
    const timestampDate = timestamp.toDate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState(content);
    const [imageDownloadUrl, setImageDownloadUrl] = useState(null);
    const [fileDownloadUrl, setFileDownloadUrl] = useState(null);
    const [isMentioned, setIsMentioned] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                let userImageDownloadUrl = '';
                if (userData.imageUrl) {
                    userImageDownloadUrl = await getDownloadURL(ref(storage, userData.imageUrl));
                }
                setUserData({
                    username: userData.username,
                    icon: userImageDownloadUrl,
                });

                if (currentServerId) {
                    const serverMemberDoc = await getDoc(doc(db, 'serverMembers', currentServerId));
                    if (serverMemberDoc.exists()) {
                        if (serverMemberDoc.data()[userId].nickname && serverMemberDoc.data()[userId].nickname !== '') {
                            setUserData({
                                username: serverMemberDoc.data()[userId].nickname,
                                icon:userImageDownloadUrl,
                            })
                        }
                    }
                }
            }
            // get image download url
            if (imageUrl) {
                let imageDownloadUrl = await getDownloadURL(ref(storage, imageUrl));
                setImageDownloadUrl(imageDownloadUrl);
            }
            // get file download url
            if (fileUrl) {
                let fileDownloadUrl = await getDownloadURL(ref(storage, fileUrl));
                setFileDownloadUrl(fileDownloadUrl);
            }
            setIsLoading(false);
        };
        fetchUserData();
       
    }, [userId]);

    const handleSave = () => {
        onEdit(newContent);
        setIsEditing(false);
      };
    
    const handleCancel = () => {
        setIsEditing(false);
        setNewContent(content);
    };

    useEffect(() => {
        const checkIfMentioned = () => {
            const mentionRegex = /@(\w+)/g;
            const matches = content.match(mentionRegex);
            if (matches) {
                for (let match of matches) {
                    const username = match.slice(1); // Remove the '@' character
                    if (username === currentUserName) {
                        setIsMentioned(true);
                        break;
                    }
                }
            }
        };
        checkIfMentioned();
    }, [content, currentUserName]);

    const createLinkMarkup = (text) => {
        // censor improper text
        const matches = matcher.getAllMatches(text);
        text = censor.applyTo(text, matches);

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const mentionRegex = /@(\w+)/g;
        const parts = text.split(/(\s+)/).map((part, index) => {
        if (part.match(urlRegex)) {
            const sanitizedUrl = DOMPurify.sanitize(part);
            const isLocalhost = sanitizedUrl.startsWith('http://localhost');
            // if it's localhost (invite link), don't open in new tab
            const targetAttr = isLocalhost ? '' : 'target="_blank" rel="noopener noreferrer"';
            return `<a href="${sanitizedUrl}" class="text-blue-500 hover:underline" ${targetAttr}>${sanitizedUrl}</a>`;
        } else if (part.match(mentionRegex)) {
            const username = part.slice(1); // Remove the '@' character
            return `<span class="bg-dc-blurple text-white font-semibold">@${DOMPurify.sanitize(username)}</span>`;
        }
        return DOMPurify.sanitize(part);
        });
        return parts.join('');
      };

    //   const onDownload = (url) => {
    //     ipcRenderer.send('download', {
    //         payload: {
    //             fileURL: url
    //         }
    //     })
    //   }

  return (
    <>
        { isLoading ? <Loading /> : (
            <div className={`flex py-1 px-4 hover:bg-dc-600 relative group ${isMentioned ? 'bg-yellow-300/40' : ''}`}>
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                    <img src={ userData.icon } alt={ userId } className='w-full h-full object-cover' />
                </div>
                <div className='flex flex-col text-sm ml-3 grow'>
                    <p className='font-medium'>
                        { userData.username }
                        <span className='text-xs font-light ml-3'>{ timestampDate.toLocaleDateString() } { timestampDate.toLocaleTimeString() }</span>
                    </p>
                    { isEditing ? (
                        <Input 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className='font-thin w-full bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                        ) : (
                            <>
                                <p className='font-thin'>
                                    <span dangerouslySetInnerHTML={{ __html: createLinkMarkup(content) }}></span>
                                    { isEdited && (
                                    <span className='ml-2 text-xs italic'>(edited)</span>
                                    )}
                                </p>
                            </>
                        )
                    }
                    {/* Display image if there is */}
                    { imageDownloadUrl && (
                        <>
                            <div className='max-w-80 max-h-80 mt-1 relative group'>
                                <img src={ imageDownloadUrl } alt={ imageUrl } className='w-full h-full object-contain object-left-top'/>
                                <a className='absolute rounded-full top-0 left-0 bg-dc-blurple opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dc-blurple/70' href={imageDownloadUrl} target='_blank' download>
                                    <IoMdDownload size={24} className='text-white m-2'/>
                                </a>
                            </div>
                        </>
                    )}
                    {/* Display file if there is */}
                    { fileDownloadUrl && (
                        <>
                            <div className='flex items-center max-w-fit h-20 mt-1 bg-dc-800 rounded-lg text-sm px-4 space-x-4'>
                                <IoDocumentSharp size={40}/>
                                <div>
                                    <p>{fileUrl.replace('chat-files/', '')}</p>
                                    <p className='font-thin'>{ fileSize }</p>
                                </div>
                                <a className='bg-dc-blurple rounded-full hover:bg-dc-blurple/70' href={fileDownloadUrl} target='_blank' download={fileUrl.replace('chat-files/', '')}>
                                    <IoMdDownload size={20} className='text-white m-2'/>
                                </a>
                            </div>
                            {/* <Button onClick={onDownload(imageDownloadUrl)}>downlaod</Button> */}
                        </>
                    )}
                </div>
                {/* Edit and Delete functionality if it's the user's message */}
                {user?.uid === userId && (
                    <div className='absolute right-0 -top-3 px-4 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave} variant='blurple' size='icon' className='w-6 h-6'>
                            <MdCheck size={15} />
                            </Button>
                            <Button onClick={handleCancel} variant='destructive' size='icon' className='w-6 h-6'>
                            <MdClose size={15} />
                            </Button>
                        </>
                        ) : (
                        <>
                            <Button onClick={() => setIsEditing(true)} variant='blurple' size='icon' className='w-6 h-6'>
                            <MdEdit size={15} />
                            </Button>
                            <Button onClick={onDelete} variant='destructive' size='icon' className='w-6 h-6'>
                            <MdDelete size={15}/>
                            </Button>
                        </>
                    )}
                    </div>
                )}
            </div>
        )}
    </>
  )
}

export default ChatMessage