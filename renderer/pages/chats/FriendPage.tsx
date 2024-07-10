import ChatSidebar from '@/components/ChatSidebar';
import Loading from '@/components/Loading'
import Sidebar from '@/components/Sidebar'
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { ReactNode, useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { and, collection, deleteDoc, doc, getDoc, getDocs, or, query, serverTimestamp, setDoc, updateDoc, where } from '@firebase/firestore';
import { db, storage } from '@/lib/firebaseConfig';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDownloadURL, ref } from 'firebase/storage';
import { v4 } from 'uuid';

type FriendPageProps = {
    children: ReactNode;
};

const FriendPage = ({ children }: FriendPageProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [blockedFriends, setBlockedFriends] = useState([]);
    const user = useAuth();

    const fetchFriendRequests = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch incoming friend requests
            const qIncoming = query(collection(db, 'friendships'), where('user2', '==', user.uid), where('accepted', '==', false));
            const incomingSnapshot = await getDocs(qIncoming);
            const incomingRequests = await Promise.all(incomingSnapshot.docs.map(async (document) => {
                const requestData = document.data();
                const senderDoc = await getDoc(doc(db, 'users', requestData.user1));
                if (senderDoc.exists()) {
                    const senderData = senderDoc.data();
                    let senderImageUrl = '';
                    if (senderData.imageUrl) {
                        senderImageUrl = await getDownloadURL(ref(storage, senderData.imageUrl));
                    }
                    return {
                        id: document.id,
                        senderId: requestData.user1,
                        senderName: senderData.username,
                        senderImageUrl: senderImageUrl,
                    };
                }
                return null;
            }));
            setIncomingRequests(incomingRequests.filter(request => request !== null));

            // Fetch outgoing friend requests
            const qOutgoing = query(collection(db, 'friendships'), where('user1', '==', user.uid), where('accepted', '==', false));
            const outgoingSnapshot = await getDocs(qOutgoing);
            const outgoingRequests = await Promise.all(outgoingSnapshot.docs.map(async (document) => {
                const requestData = document.data();
                const receiverDoc = await getDoc(doc(db, 'users', requestData.user2));
                if (receiverDoc.exists()) {
                    const receiverData = receiverDoc.data();
                    let receiverImageUrl = '';
                    if (receiverData.imageUrl) {
                        receiverImageUrl = await getDownloadURL(ref(storage, receiverData.imageUrl));
                    }
                    return {
                        id: document.id,
                        receiverId: requestData.user2,
                        receiverName: receiverData.username,
                        receiverImageUrl: receiverImageUrl,
                    };
                }
                return null;
            }));
            setOutgoingRequests(outgoingRequests.filter(request => request !== null))
        } catch (error) {
        console.error('Error fetching friend requests:', error);
        }
        setIsLoading(false);
    };

    const fetchFriends = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const blockedUsers = userSnap.exists() ? userSnap.data().blocks || {} : {};

          const q = query(collection(db, 'friendships'), where('accepted', '==', true), where('user1', '==', user.uid));
          const q2 = query(collection(db, 'friendships'), where('accepted', '==', true), where('user2', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const querySnapshot2 = await getDocs(q2);
          const friends = await Promise.all(
            [...querySnapshot.docs, ...querySnapshot2.docs].map(async (document) => {
              const requestData = document.data();
              const friendId = requestData.user1 === user.uid ? requestData.user2 : requestData.user1;
              if (blockedUsers[friendId]) return null;
              const friendDoc = await getDoc(doc(db, 'users', friendId));
              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                let friendImageUrl = '';
                if (friendData.imageUrl) {
                  friendImageUrl = await getDownloadURL(ref(storage, friendData.imageUrl));
                }
                return {
                  id: document.id,
                  friendId: friendId,
                  friendName: friendData.username,
                  friendImageUrl: friendImageUrl,
                };
              }
              return null;
            })
          );
          setFriends(friends.filter((friend) => friend !== null));
        } catch (error) {
          console.error('Error fetching friends:', error);
        }
        setIsLoading(false);
      };

      const fetchBlockedFriends = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
          const q = query(collection(db, 'blocks'), where('blockerUser', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const blocked = await Promise.all(
            querySnapshot.docs.map(async (document) => {
              const requestData = document.data();
              const friendId = requestData.blockedUser;
              const friendDoc = await getDoc(doc(db, 'users', friendId));
              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                let friendImageUrl = '';
                if (friendData.imageUrl) {
                  friendImageUrl = await getDownloadURL(ref(storage, friendData.imageUrl));
                }
                return {
                  id: document.id,
                  friendId: friendId,
                  friendName: friendData.username,
                  friendImageUrl: friendImageUrl,
                };
              }
              return null;
            })
          );
          setBlockedFriends(blocked.filter((friend) => friend !== null));
        } catch (error) {
          console.error('Error fetching blocked friends:', error);
        }
        setIsLoading(false);
      };

      const handleRefresh = () => {
        fetchFriendRequests();
        fetchFriends();
        fetchBlockedFriends();
      }

    useEffect(() => {
        handleRefresh();
    }, [user]);

    return (
    <>
        <Sidebar chatIsActive />
        {isLoading ? ( <Loading /> ) : (
                <div className="w-full h-screen flex pl-16 relative bg-red-900">
                    <ChatSidebar />
                    <div className="grow h-screen ml-60 bg-dc-700 flex flex-col">
                        <Tabs defaultValue='requests'>
                            <div className='w-full min-h-12 shadow-md flex items-center px-2'>
                                <TabsList>
                                    <TabsTrigger value="requests">Requests</TabsTrigger>
                                    <TabsTrigger value="online">Online</TabsTrigger>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="blocked">Blocked</TabsTrigger>
                                </TabsList>
                            </div>
                            {/* Content */}
                            <ScrollArea className='h-full'>
                                <div className='flex flex-col space-y-6 h-[685px]'>
                                    <TabsContent value="requests">
                                        <div>
                                        {incomingRequests.length > 0 ? (
                                            <>
                                            <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'>Incoming Friend Requests</p>
                                            {incomingRequests.map(request => ( 
                                                <RequestItem
                                                    key={request.id}
                                                    requestId={request.id}
                                                    senderId={request.senderId}
                                                    senderName={request.senderName}
                                                    senderImageUrl={request.senderImageUrl}
                                                    onRequestAction={handleRefresh}
                                                />
                                            ))}
                                            </>
                                        ) : (
                                            <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'> No Incoming Friend Requests</p>
                                        )}
                                        <div className='h-8' />
                                        {outgoingRequests.length > 0 ? (
                                                <>
                                                <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'>Outgoing Friend Requests</p>
                                                {outgoingRequests.map(request => ( 
                                                    <OutgoingRequestItem
                                                        key={request.id}
                                                        requestId={request.id}
                                                        receiverId={request.receiverId}
                                                        receiverName={request.receiverName}
                                                        receiverImageUrl={request.receiverImageUrl}
                                                        onRequestAction={handleRefresh}
                                                    />
                                                ))}
                                                </>
                                            ) : (
                                                <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'> No Outgoing Friend Requests</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="online">
                                        <div>
                                            <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'> No Online Friends :(</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="all">
                                        <div>
                                            {friends.length > 0 ? (
                                                friends.map((friend) => (
                                                <FriendItem
                                                    key={friend.id}
                                                    friendshipId={friend.id}
                                                    friendId={friend.friendId}
                                                    friendName={friend.friendName}
                                                    friendImageUrl={friend.friendImageUrl}
                                                    onRemoveFriend={handleRefresh}
                                                    user={user}
                                                />
                                                ))
                                            ) : (
                                                <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'> No Friends :(</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="blocked">
                                        <div>
                                            {blockedFriends.length > 0 ? (
                                                blockedFriends.map((friend) => (
                                                <BlockedFriendItem
                                                    key={friend.id}
                                                    blockId={friend.id}
                                                    friendId={friend.friendId}
                                                    friendName={friend.friendName}
                                                    friendImageUrl={friend.friendImageUrl}
                                                    onUnblock={handleRefresh}
                                                    user={user}
                                                />
                                                ))
                                            ) : (
                                                <p className='ml-2 text-xs font-semibold tracking-widest uppercase text-primary/80'> No Blocked Users</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div> 
                </div>
            )}
    </>
    )
}

type RequestItemProps = {
    requestId: string;
    senderId: string;
    senderName: string;
    senderImageUrl: string;
    onRequestAction: () => void;
  };
  
  const RequestItem = ({ requestId, senderId, senderName, senderImageUrl, onRequestAction }: RequestItemProps) => {
    const handleAccept = async () => {
      try {
        await updateDoc(doc(db, 'friendships', requestId), {
          accepted: true,
        });
        onRequestAction();
      } catch (error) {
        console.error('Error accepting friend request:', error);
      }
    };
  
    const handleReject = async () => {
      try {
        await deleteDoc(doc(db, 'friendships', requestId));
        onRequestAction();
      } catch (error) {
        console.error('Error rejecting friend request:', error);
      }
    };
  
    return (
      <div className='flex items-center p-4 bg-dc-900 rounded-md m-2'>
        <div className='w-10 h-10 rounded-full overflow-hidden' >
            <img src={senderImageUrl} alt={senderName} className='w-full h-full object-cover'/>
        </div>
        <div className='ml-4'>
          <p className='text-primary font-semibold'>{senderName}</p>
        </div>
        <div className='ml-auto flex space-x-2'>
          <Button variant='blurple' onClick={handleAccept}>Accept</Button>
          <Button variant='destructive' onClick={handleReject}>Reject</Button>
        </div>
      </div>
    );
  };

type OutgoingRequestItemProps = {
    requestId: string;
    receiverId: string;
    receiverName: string;
    receiverImageUrl: string;
    onRequestAction: () => void;
};

const OutgoingRequestItem = ({ requestId, receiverId, receiverName, receiverImageUrl, onRequestAction }: OutgoingRequestItemProps) => {
    const handleCancel = async () => {
        try {
            await deleteDoc(doc(db, 'friendships', requestId));
            onRequestAction();
        } catch (error) {
            console.error('Error canceling friend request:', error);
        }
    };

    return (
        <div className='flex items-center p-4 bg-dc-900 rounded-md m-2'>
            <div className='w-10 h-10 rounded-full overflow-hidden' >
                <img src={receiverImageUrl} alt={receiverName} className='w-full h-full object-cover'/>
            </div>
            <div className='ml-4'>
                <p className='text-primary font-semibold'>{receiverName}</p>
            </div>
            <div className='ml-auto flex space-x-2'>
                <Button variant='destructive' onClick={handleCancel}>Cancel Request</Button>
            </div>
        </div>
    );
};

  type FriendItemProps = {
    friendshipId: string;
    friendId: string;
    friendName: string;
    friendImageUrl: string;
    onRemoveFriend: () => void;
    user: any;
  };
  
  const FriendItem = ({ friendshipId, friendId, friendName, friendImageUrl, onRemoveFriend, user }: FriendItemProps) => {
    const handleRemove = async () => {
      try {
        await deleteDoc(doc(db, 'friendships', friendshipId));
        onRemoveFriend();
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    };

    const handleBlock = async () => {
        try {
          await setDoc(doc(db, 'blocks', 'block' + v4()), {
            blockedUser: friendId,
            blockerUser: user.uid,
            timestamp: serverTimestamp(),
          });
          await updateDoc(doc(db, 'users', user.uid), {
            [`blocks.${friendId}`]: true
          })
          onRemoveFriend();
        } catch (error) {
          console.error('Error blocking friend:', error);
        }
      };
  
    return (
      <div className='flex items-center p-4 bg-dc-900 rounded-md m-2'>
        <div className='w-10 h-10 rounded-full overflow-hidden'>
          <img src={friendImageUrl} alt={friendName} className='w-full h-full object-cover' />
        </div>
        <div className='ml-4'>
          <p className='text-primary font-semibold'>{friendName}</p>
        </div>
        <div className='ml-auto flex space-x-2'>
          <Button variant='blurple'>Message</Button>
          <Button variant='destructive' onClick={handleRemove}>Remove</Button>
          <Button variant='destructive' onClick={handleBlock}>Block</Button>
        </div>
      </div>
    );
  };

  type BlockedFriendItemProps = {
    blockId: string;
    friendId: string;
    friendName: string;
    friendImageUrl: string;
    onUnblock: () => void;
    user: any;
  };
  
    const BlockedFriendItem = ({ blockId, friendId, friendName, friendImageUrl, onUnblock, user }: BlockedFriendItemProps) => {
        const handleUnblock = async () => {
            try {
                await deleteDoc(doc(db, 'blocks', blockId));

                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (userData.blocks && userData.blocks[friendId]) {
                        const updatedBlocks = { ...userData.blocks };
                        delete updatedBlocks[friendId];
                        await updateDoc(userRef, { blocks: updatedBlocks });
                    }
                }

                onUnblock();
            } catch (error) {
                console.error('Error unblocking friend:', error);
            }
        };
    
        return (
        <div className='flex items-center p-4 bg-dc-900 rounded-md m-2'>
            <div className='w-10 h-10 rounded-full overflow-hidden'>
            <img src={friendImageUrl} alt={friendName} className='w-full h-full object-cover' />
            </div>
            <div className='ml-4'>
            <p className='text-primary font-semibold'>{friendName}</p>
            </div>
            <div className='ml-auto flex space-x-2'>
            <Button variant='destructive' onClick={handleUnblock}>Unblock</Button>
            </div>
        </div>
        );
    };

export default FriendPage