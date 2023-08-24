import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions'
import PostAttach from '@/components/forms/PostAttach'
import ProfileHeader from '@/components/shared/ProfileHeader'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { groupTabs } from '@/constants'
import AttachesTab from '@/components/shared/AttachesTab'
import UserCard from '@/components/cards/UserCard'
import { fetchGroupDetails } from '@/lib/actions/group.actions'

async function Page({ params }: { params: { id: string}}) {
    const user = await currentUser()

    if(!user) return null
    
    const groupDetails = await fetchGroupDetails(params.id)


    return (
        <section>
            <ProfileHeader 
            accountId={groupDetails.id}
            authUserId={user.id}
            name={groupDetails.name}
            username={groupDetails.username}
            imgUrl={groupDetails.image}
            bio={groupDetails.bio}
            type="Group"
            />
            <div className='mt-9'>
                <Tabs defaultValue="attaches" className="w-full">
                    <TabsList className="tab">
                        {groupTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                                <Image src={tab.icon} alt={tab.label} width={24} height={24} className='object-contain'/>
                                <p className='max-sm:hidden'>{tab.label}</p>

                                {tab.label === 'Attaches' && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium texgt-light-2'>
                                        {groupDetails?.attaches?.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                        <TabsContent value="attaches"
                        className='w-full text-light-1'>
                            <AttachesTab 
                            currentUserId={user.id}
                            accountId={groupDetails._id}
                            accountType="Group"
                            />
                        </TabsContent>
                        <TabsContent value="members"
                        className='w-full text-light-1'>
                            <section className='mt-9 flex flex-col gap-10'>
                                {groupDetails?.members.map((member: any) => (
                                    <UserCard 
                                    key={member.id}
                                    id={member.id}
                                    name={member.name}
                                    username={member.username}
                                    imgUrl={member.image}
                                    personType='User'
                                    />
                                ))}
                            </section>
                        </TabsContent>
                        <TabsContent value="requests"
                        className='w-full text-light-1'>
                            <AttachesTab 
                            currentUserId={user.id}
                            accountId={groupDetails._id}
                            accountType="Group"
                            />
                        </TabsContent>
                    
                </Tabs>
            </div>
        </section>
    )
}

export default Page

