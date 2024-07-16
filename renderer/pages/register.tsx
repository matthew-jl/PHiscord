import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, doc, setDoc } from "@firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Create zod schema for the form
const formSchema = z
  .object({
    username: z.string().min(1, {
      message: "Username is required.",
    }),
    email: z.string().email({
      message: "Invalid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters long.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const router = useRouter();
  const isAuthenticated = useAuth();
  const [error, setError] = useState("");

  if (isAuthenticated) {
    router.push("/chats/FriendPage");
  }

  // Use form hook with zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // Adds user data to Cloud Firestore database in "users" collection
      const data = {
        email: user.email,
        username: values.username,
        imageUrl: "user-icons/profile-picture-placeholder-yellow.png",
      };
      await setDoc(doc(db, "users", user.uid), data);

      router.push("/chats/FriendPage");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError("Failed to create an account. Please try again later.");
      }
      console.error(error.code, error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-dc-900">
      <div className="absolute top-6 right-0 p-2">
        <ModeToggle />
      </div>
      <div className="flex flex-col bg-dc-700 min-w-96 text-primary p-7 rounded-lg shadow-md">
        <h2 className="font-bold text-xl mb-1 text-center">
          Create an account
        </h2>
        <p className="text-sm mb-4 text-center">
          Enjoy your journey in PHiscord!
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignUp)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-primary">
                    USERNAME
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-primary">
                    EMAIL
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-primary">
                    PASSWORD
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-primary">
                    CONFIRM PASSWORD
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="min-w-full bg-dc-900 p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              disabled={form.formState.isSubmitting}
              variant="blurple"
              className="font-bold min-w-full"
            >
              Register
            </Button>
          </form>
        </Form>
        <div className="text-left text-sm mt-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
