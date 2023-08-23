import { fetchUserPosts } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"
import AttachCard from "../cards/AttachCard"

interface Props {
    currentUserId: string
    accountId: string
    accountType: string
}

const AttachesTab = async({currentUserId, accountId, accountType }: Props) => {

    let result = await fetchUserPosts(accountId)

   if(!result) redirect('/')


    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.attaches.map((attach: any) => (
            <AttachCard 
              key={attach._id}
              id={attach._id}
              currentUserId={currentUserId}
              parentId={attach.parentId}
              content={attach.text}
              author={
                accountType === 'User'
                ? { name: result.name, image: result.image, id: result.id} : {name: attach.author.name, image: attach.author.image, id: attach.author.id}
              }
              group={attach.group}
              createdAt={attach.createdAt}
              comments={attach.children}
                />
            ))}
        </section>  
    )
}

export default AttachesTab