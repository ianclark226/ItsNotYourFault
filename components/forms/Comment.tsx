'use client'


import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
 import { CommentValidation } from "@/lib/validations/attach";
 import { addCommentToAttach } from "@/lib/actions/attach.action";
import { Button } from "@/components/ui/button"
import Image from  "next/image"
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

import * as z from 'zod'

// import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { createAttach } from "@/lib/actions/attach.action";

interface Props {
    attachId: string,
    currentUserImg: string,
    currentUserId: string
}

const Comment = ({ attachId, currentUserImg, currentUserId }: Props) => {

    const router = useRouter()
    const pathname = usePathname()
    

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            attach: '',
            
        }
    })

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToAttach(attachId, values.attach, JSON.parse(currentUserId), pathname
            
        )

        form.reset()

    
    }


    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} 
        className="comment-form">

<FormField
            control={form.control}
            name="attach"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 w-full">
                <FormLabel>
                    <Image 
                    src={currentUserImg}
                    alt="current user"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    />
                    </FormLabel>
                <FormControl className="border-none bg-transparent">
                  <Input
                    type='text'
                    placeholder="Comment..."
                    className="no-focus text-light-1 outline-none"
                    {...field}
                  />
                </FormControl>
                
              </FormItem>
            )}
          />

          <Button type="submit" className="comment-form_btn">
            Reply 
          </Button>
        </form>
        </Form>
    )
} 

export default Comment