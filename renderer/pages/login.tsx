import Link from "next/link";
import React, { useState } from "react";
import { auth } from "../lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/hooks/useAuth";
import { ModeToggle } from "@/components/mode-toggle";
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

// make a schema using zod for the form
const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const LoginPage = () => {
  const isAuthenticated = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/chats/FriendPage");
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const [error, setError] = useState("");

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    const { email, password } = values;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);
      router.push("/chats/FriendPage");
    } catch (error) {
      console.log(error);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-dc-900">
      <div className="absolute top-6 right-0 p-2">
        <ModeToggle />
      </div>
      {/* <Link href="/home">Go to home</Link> */}
      <div className="flex flex-col bg-dc-700 min-w-96 text-primary p-7 rounded-lg shadow-md">
        <h2 className="font-bold text-xl mb-1 text-center">Welcome back!</h2>
        <p className="text-sm mb-4 text-center">
          We're so excited to see you again in PHiscord!
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignIn)}
            className="space-y-4"
          >
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              disabled={isLoading}
              variant="blurple"
              className="font-bold min-w-full"
            >
              Log In
            </Button>
          </form>
        </Form>
        <div className="text-left text-sm mt-4">
          <Link href="/register" className="text-blue-500 hover:underline">
            Need an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
