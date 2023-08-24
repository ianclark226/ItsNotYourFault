import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import PostAttach from '@/components/forms/PostAttach'
import ProfileHeader from '@/components/shared/ProfileHeader'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { profileTabs } from '@/constants'
import AttachesTab from '@/components/shared/AttachesTab'
import UserCard from '@/components/cards/UserCard'
import { fetchGroups } from '@/lib/actions/group.actions'
import GroupCard from '@/components/cards/GroupCard'

async function Page() {
    const user = await currentUser()

    if(!user) return null
    const userInfo = await fetchUser(user.id)

    if(!userInfo?.onboarded) redirect('/onboarding')

    const result = await fetchGroups({
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })


    return (
        <section>
            <h1 className='head-text mb-10'>Search</h1>
            <div className='mt-14 flex flex-col gap-9'>
                {result.groups.length === 0 ? (
                    <p className='no-result'>No Users</p>
                ): (
                    <>
                    {result.groups.map((group) => (
                        <GroupCard
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        username={group.username}
                        imgUrl={group.image}
                        bio={group.bio}
                        members={group.members}
                        
                        />
                    ))}
                    </>
                )}
            </div>
            </section>
    )
}

export default Page