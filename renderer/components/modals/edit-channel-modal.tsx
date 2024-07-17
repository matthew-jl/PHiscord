import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/lib/hooks/useModalStore";
import { db, storage } from "@/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteField,
  deleteDoc,
} from "@firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/router";
import { v4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { FaHashtag } from "react-icons/fa";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { useToast } from "../ui/use-toast";

// make a schema using zod for the form
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Channel name is required.",
  }),
});

const EditChannelModal = () => {
  const { toast } = useToast();
  const router = useRouter();
  let { serverId, channelId } = router.query;
  serverId = Array.isArray(serverId) ? serverId[0] : serverId;
  channelId = Array.isArray(channelId) ? channelId[0] : channelId;
  const [channelData, setChannelData] = useState(null);

  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editChannel";

  useEffect(() => {
    const fetchChannelData = async () => {
      const channelsDoc = await getDoc(doc(db, "channels", channelId));
      if (channelsDoc.exists()) {
        setChannelData(channelsDoc.data());
        form.reset({
          name: channelsDoc.data().name,
        });
      }
    };
    if (channelId) fetchChannelData();
  }, [router]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const editChannel = async (newName) => {
    // channels
    const channelsRef = doc(db, "channels", channelId);
    const channelsUpdateData = { name: newName };
    await updateDoc(channelsRef, channelsUpdateData);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const name = values.name;
    editChannel(name);

    toast({
      description: "Successfully edited channel name.",
    });

    handleClose();

    router.reload();
  };

  const deleteChannel = async () => {
    // serverChannels
    const serverChannelsRef = doc(db, "serverChannels", serverId);
    if (serverChannelsRef) {
      await updateDoc(serverChannelsRef, {
        [channelId]: deleteField(),
      });
    }
    // channelMessages
    const channelMessagesRef = doc(db, "channelMessages", channelId);
    await deleteDoc(channelMessagesRef);
    // channels
    const channelsRef = doc(db, "channels", channelId);
    await deleteDoc(channelsRef);

    toast({
      description: "Successfully deleted channel.",
    });
    handleClose();
    router.push(`/servers/${serverId}/ServerPage`);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dc-800">
        <DialogHeader>
          <DialogTitle className="text-center text-primary text-2xl">
            Edit Channel
          </DialogTitle>
          <DialogDescription className="text-center text-dc-500">
            Change your channel name or delete it :(
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-primary">
                      CHANNEL NAME
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-dc-900 text-primary placeholder:text-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter your channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={isLoading}
                variant="destructive"
                onClick={deleteChannel}
              >
                Delete Channel
              </Button>
              <Button disabled={isLoading} variant="blurple">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;
