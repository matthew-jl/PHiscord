import { useRouter } from "next/router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ServerPage from "../../ServerPage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { db, storage } from "@/lib/firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import Loading from "@/components/Loading";
import { MdEmojiEmotions } from "react-icons/md";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { IoDocumentSharp, IoSearch, IoSend } from "react-icons/io5";
import { FaHashtag } from "react-icons/fa";
import ChatMessage from "@/components/ChatMessage";
import { useAuth } from "@/lib/hooks/useAuth";
import { v4 } from "uuid";
import { Label } from "@/components/ui/label";
import { RiArrowDropDownLine, RiAttachment2 } from "react-icons/ri";
import { ref, uploadBytes } from "firebase/storage";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import MediaRoom from "@/components/MediaRoom";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";

const ChannelPage = () => {
  const { theme } = useTheme();
  let emojiPickerTheme = Theme.AUTO;
  if (theme == "dark") {
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
  const [currentUserName, setCurrentUserName] = useState(null);
  const [serverMemberData, setServerMemberData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [serverData, setServerData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !serverId || !channelId) return;
      setIsLoading(true);
      try {
        const [serverMemberDoc, userDoc, channelDoc, serverDoc] =
          await Promise.all([
            getDoc(doc(db, "serverMembers", serverId)),
            getDoc(doc(db, "users", user.uid)),
            getDoc(doc(db, "channels", channelId)),
            getDoc(doc(db, "servers", serverId)),
          ]);

        if (
          serverMemberDoc.exists() &&
          userDoc.exists() &&
          channelDoc.exists() &&
          serverDoc.exists()
        ) {
          const serverMemberData = serverMemberDoc.data();
          const userData = userDoc.data();

          setCurrentUserName(
            serverMemberData[user.uid]?.nickname || userData.username
          );
          setChannelData(channelDoc.data());
          setServerMemberData(serverMemberDoc.data());
          setServerData(serverDoc.data());

          const unSub = onSnapshot(
            doc(db, "channelMessages", channelId),
            (doc) => {
              setChat(doc.data());
              setIsLoading(false);
            }
          );

          return () => unSub();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, serverId, channelId]);

  // Read chat real-time
  const [chat, setChat] = useState(null);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const handleSearch = () => {
    if (!chat || !chat.messages) return;
    const results = chat.messages.filter((message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  // Scroll to bottom automatically
  const scrollAreaRef = useRef(null);
  const scrollToBottom = () => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("scrolled");
  };

  useLayoutEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        scrollToBottom();
      }, 1000);
    }
  }, [chat]);

  // append emoji to text when emoji is chosen
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  // to convert file size to have formats
  const formatFileSize = (size) => {
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let readableSize = size;

    while (readableSize >= 1024 && unitIndex < units.length - 1) {
      readableSize = parseFloat(readableSize) / 1024;
      unitIndex++;
    }
    // round up to 2 decimals and add the format to the end
    readableSize = readableSize.toFixed(2) + " " + units[unitIndex];
    console.log(readableSize);

    return readableSize;
  };

  const [text, setText] = useState("");
  const [file, setFile] = useState({
    type: null, // can be image or file
    file: null,
    url: "",
    uploadUrl: "",
    size: null,
  });
  const handleFile = (e) => {
    if (e.target.files[0]) {
      const fileType = e.target.files[0].type.startsWith("image/")
        ? "image"
        : "file";
      console.log(e.target.files[0].size);
      const fileSize = formatFileSize(e.target.files[0].size);
      if (fileType === "image") {
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
      console.log("file/image not found");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const fileUrl = URL.createObjectURL(droppedFile);
      const fileType = droppedFile.type.startsWith("image") ? "image" : "file";
      const fileSize = formatFileSize(droppedFile.size);
      if (fileType === "image") {
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
      setText("");
      setFile({
        type: null,
        file: null,
        url: "",
        uploadUrl: "",
        size: null,
      });
    };
  }, [router]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = async () => {
    if (text === "" && !file.file) return;
    try {
      if (file.file) {
        const fileRef = ref(storage, file.uploadUrl);
        await uploadBytes(fileRef, file.file).then(() => {
          console.log("file/image uploaded");
        });
      }

      await updateDoc(doc(db, "channelMessages", channelId), {
        messages: arrayUnion({
          userId: user.uid,
          content: text,
          timestamp: new Date(),
          ...(file.uploadUrl != "" && { [`${file.type}Url`]: file.uploadUrl }), // either imageType or fileType
          ...(file.type === "file" && { fileSize: file.size }),
        }),
      });
      console.log("successfully added data to channelMessages");

      // Send a notification to other users in the server
      const otherUserIds = Object.keys(serverMemberData).filter(
        (userId) => userId != user.uid
      );
      otherUserIds.forEach(async (userId) => {
        const notificationsRef = await getDoc(doc(db, "notifications", userId));
        if (notificationsRef.exists()) {
          await updateDoc(doc(db, "notifications", userId), {
            messages: arrayUnion({
              username: currentUserName,
              content: text,
              timestamp: new Date(),
              serverId: serverId,
              serverName: serverData.name,
              channelId: channelId,
              channelName: channelData.name,
            }),
          });
        } else {
          await setDoc(doc(db, "notifications", userId), {
            messages: arrayUnion({
              username: currentUserName,
              content: text,
              timestamp: new Date(),
              serverId: serverId,
              serverName: serverData.name,
              channelId: channelId,
              channelName: channelData.name,
            }),
          });
        }
        console.log("successfully added data to notifications");
      });
    } catch (error) {
      console.log(error);
    }
    setText("");
    setFile({
      type: null,
      file: null,
      url: "",
      uploadUrl: "",
      size: null,
    });
  };

  const handleDelete = async (message) => {
    try {
      await updateDoc(doc(db, "channelMessages", channelId), {
        messages: arrayRemove(message),
      });
      console.log("successfully deleted message");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (message, newContent) => {
    try {
      const channelDocRef = doc(db, "channelMessages", channelId);
      const channelDoc = await getDoc(channelDocRef);
      const messages = channelDoc.data().messages;
      const newMessages = messages.map((msg) => {
        if (msg.timestamp.toMillis() == message.timestamp.toMillis()) {
          return { ...msg, content: newContent, isEdited: true };
        } else {
          return msg;
        }
      });

      await updateDoc(channelDocRef, {
        messages: newMessages,
      });
      console.log("successfully edited message");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ServerPage>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="grow h-screen mx-60 bg-dc-700 flex flex-col pt-6">
          {/* Chat Header */}
          <div className="w-full min-h-12 shadow-md flex items-center text-sm text-left px-4">
            {channelData.type === "text" && (
              <FaHashtag className="text-dc-500" />
            )}
            {channelData.type === "voice" && (
              <HiMiniSpeakerWave className="text-dc-500" />
            )}
            <div className="grow pl-2 font-semibold">{channelData.name}</div>
            {/* Search Bar */}
            <div className="relative ml-4 w-96">
              <Input
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-8"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="blurple"
                    onClick={handleSearch}
                    className="absolute right-0 top-0 h-8 w-8"
                  >
                    <IoSearch />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 p-2 bg-dc-900"
                  side="bottom"
                  align="end"
                >
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
                        currentServerId={serverId}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-primary/80">No results found</p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* Content */}
          {/* Text Channel */}
          {channelData.type === "text" && (
            <>
              <ScrollArea className="h-full">
                <div className="flex flex-col space-y-6 h-[685px]">
                  <div className="flex-1" />
                  <div className="space-y-2 px-4">
                    <div className="bg-dc-900 rounded-full w-fit p-4">
                      <FaHashtag size={40} />
                    </div>
                    <p className="text-2xl font-bold">
                      Welcome to #{channelData.name}!
                    </p>
                    <p className="text-sm text-primary/80">
                      This is the start of the #{channelData.name} channel.
                    </p>
                  </div>
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
                          onEdit={(newContent) =>
                            handleEdit(message, newContent)
                          }
                          isEdited={message?.isEdited}
                          imageUrl={message?.imageUrl}
                          fileUrl={message?.fileUrl}
                          fileSize={message?.fileSize}
                          currentUserName={currentUserName}
                          currentServerId={serverId}
                        />
                      ))}
                  </div>
                  <div ref={scrollAreaRef}></div>
                </div>
              </ScrollArea>
              {/* Chat Input */}
              <div className="w-full h-fit px-4 pb-4 pt-2 relative flex space-x-2">
                {/* Main Input */}
                <Input
                  className="bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder={`Message #${channelData.name}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onKeyDown={handleKeyDown}
                />
                {/* Image Attachment */}
                <Label
                  htmlFor="imageInput"
                  className="absolute right-28 bottom-6 cursor-pointer"
                >
                  <RiAttachment2 size={24} />
                </Label>
                <Input
                  type="file"
                  id="imageInput"
                  className="hidden"
                  onChange={handleFile}
                />
                {file.file && (
                  <div className="absolute right-16 bottom-16 w-60 h-fit bg-dc-900 rounded-md p-2 ">
                    {file.type === "image" && (
                      <>
                        <p className="text-xs">
                          Image selected: {file.file.name}
                        </p>
                        <div className="w-52 h-52 mx-auto my-2">
                          <img
                            src={file.url}
                            alt={file.file.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </>
                    )}
                    {file.type === "file" && (
                      <>
                        <p className="text-xs">
                          File selected: {file.file.name}
                        </p>
                        <div className="w-52 h-52 mx-auto my-2 flex flex-col justify-center items-center">
                          <IoDocumentSharp size={60} />
                          <p className="text-sm">{file.size}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* Emoji Picker */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="absolute right-20 bottom-6">
                    <MdEmojiEmotions size={24} className="" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    sideOffset={5}
                    alignOffset={-22}
                    className="bg-transparent border-transparent shadow-none"
                  >
                    <EmojiPicker
                      theme={emojiPickerTheme}
                      onEmojiClick={handleEmoji}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Send Button */}
                <Button size="icon" variant="blurple" onClick={handleSend}>
                  <IoSend />
                </Button>
                {/* Scroll Button */}
                <Button
                  onClick={scrollToBottom}
                  variant="outline"
                  size="icon"
                  className="absolute right-4 bottom-16 rounded-full bg-dc-900"
                >
                  <RiArrowDropDownLine size={24} className="text-primary" />
                </Button>
              </div>
            </>
          )}
          {/* Voice Channel */}
          {channelData.type === "voice" && (
            <div className="w-full h-full">
              <MediaRoom chatId={channelId} audio={true} video={false} />
            </div>
          )}
        </div>
      )}
    </ServerPage>
  );
};

export default ChannelPage;
