// import { UserButton } from "@clerk/nextjs";
import { fetchPosts } from "@/lib/actions/attach.action"
import { currentUser } from "@clerk/nextjs"
import AttachCard from "@/components/cards/AttachCard"


export default async function Home() {

  const result = await fetchPosts(1, 30)
  const user = await currentUser()



  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
          {result.posts.length === 0 ? (
            <p className="no-result">No Attaches Found</p>
          ) : (
            <>
            {result.posts.map((post) => (
              <AttachCard
              key={post._id}
              id={post._id}
              currentUserId={user?.id || ""}
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              group={post.group}
              createdAt={post.createdAt}
              comments={post.children}
              />
            ))}
            </>
          )}
      </section>
    </>
  )
}
