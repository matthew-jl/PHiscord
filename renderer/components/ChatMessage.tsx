import { db, storage } from '@/lib/firebaseConfig';
import { doc, getDoc, Timestamp } from '@firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { Button } from './ui/button';
import { MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import { Input } from './ui/input';
import { useAuth } from '@/lib/hooks/useAuth';

type chatMessageProps = {
    userId: string;
    content: string;
    timestamp: Timestamp;
    onDelete: () => void;
    onEdit: (newContent: string) => void;
    isEdited?: boolean;
}

const ChatMessage = ({ userId, content, timestamp, onDelete, onEdit, isEdited }: chatMessageProps) => {
    const user = useAuth();
    const timestampDate = timestamp.toDate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState(content);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                let imageDownloadUrl = '';
                if (userData.imageUrl) {
                    imageDownloadUrl = await getDownloadURL(ref(storage, userData.imageUrl));
                }
                setUserData({
                    username: userData.username,
                    icon: imageDownloadUrl,
                });
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

  return (
    <>
        { isLoading ? <Loading /> : (
            <div className='flex py-1 px-4 hover:bg-dc-600 relative group'>
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                    <img src={ userData.icon } alt={ userId } className='object-cover' />
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
                                    { content }
                                    { isEdited && (
                                    <span className='ml-2 text-xs italic'>(edited)</span>
                                    )}
                                </p>
                            </>
                        )
                    }
                </div>
                {user?.uid === userId && (
                    <div className='absolute right-0 -top-3 px-4 space-x-1 opacity-0 group-hover:opacity-100'>
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