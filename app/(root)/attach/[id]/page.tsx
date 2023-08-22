import AttachCard from "@/components/cards/AttachCard"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchAttachById } from "@/lib/actions/attach.action"

const Page = async ({ params }: { params: { id: string }}) => {

    if(!params.id) return null

    const user = await currentUser()
    if(!user) return null

    const userInfo = await fetchUser(user.id)
    if(!userInfo.onboarded) redirect('/onboarding')

    const attach = await fetchAttachById(params.id)

    return (
        <section className="relative">
            <div>
            <AttachCard
              key={attach._id}
              id={attach._id}
              currentUserId={user?.id || ""}
              parentId={attach.parentId}
              content={attach.text}
              author={attach.author}
              group={attach.group}
              createdAt={attach.createdAt}
              comments={attach.children}
              />
            </div>
        </section>
    )
}

export default Page