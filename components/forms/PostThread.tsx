'use client'


import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
 import { PostValidation } from "@/lib/validations/thread";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea";
import * as z from 'zod'

// import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    }
    btnTitle: string;
}



    

function PostThread({ userId }: {userId: string}) {


    const router = useRouter()
    const pathname = usePathname()
    

    const form = useForm({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            post: '',
            accountId: userId,
        }
    })

    const onSubmit = () => {

    }

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col justify-start gap-10">

<FormField
            control={form.control}
            name="post"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3 w-full">
                <FormLabel className="text-base-semibold text-light-2">
                    Content
                    </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea
                    rows={15}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
        </Form>
    )
}

export default PostThread