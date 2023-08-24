import { currentUser } from "@clerk/nextjs"
import UserCard from "../cards/UserCard"

import { fetchGroups } from "@/lib/actions/group.actions"
import { fetchUsers } from "@/lib/actions/user.actions"
import User from "@/lib/models/user.model"


async function RightSideBar() {

    const user = await currentUser()
    if(!user) return null
    const similarExpriences = await fetchUsers({
        userId: user.id,
        pageSize: 4
    })

    const suggestedGroups = await fetchGroups({ pageSize: 4})

    return (
        <section className="custom-scrollbar rightsidebar">
            <div className="flex flex-1 flex-col justify-start">
                <h3 className="text-heading4-medium text-light-1">Suggested Pages</h3>
            <div className="mt-7 flex w-[350px] flex-col gap-9">
                {suggestedGroups.groups.length > 0 ? (
                    <>
                    {suggestedGroups.groups.map((group) => (
                        <UserCard
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        username={group.username}
                        imgUrl={group.image}
                        personType="Group"
                        />
                    ))}
                    </>
                ): (
                    <p className="!text-base-regular text-light-3">
                        No Groups Yet
                    </p>
                )}
                </div> 
            </div>

            <div className="flex flex-1 flex-col justify-start">
                <h3 className="text-heading4-medium text-light-1">Similar Expriences</h3>
                <div className="mt-7 flex w-[350px] flex-col gap-10">
                    
                    {similarExpriences.users.length > 0 ? (
                    <>
                    {similarExpriences.users.map((person) => (
                        <UserCard
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        username={person.username}
                        imgUrl={person.image}
                        personType="User"
                        />
                    ))}
                    </>
                    ): (
                        <p className="!text-base-regular text-light-3">No Users Yet</p>
                    )}
                </div>
            </div>
        </section>
    )
}

export default RightSideBar