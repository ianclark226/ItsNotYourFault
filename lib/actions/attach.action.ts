'use server'
import { connectToDB } from "../mongoose";
import Attach from '../models/attach.model'
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
    text: string,
    author: string,
    groupId: string | null,
    path: string,
}

export async function createAttach({text, author, groupId, path}: Params) {

    try {

        connectToDB()

    const createdAttach = await Attach.create({
        text,
        author,
        groupId: null,
    })

    // UPdate user model
    await User.findByIdAndUpdate(author, {
        $push: { attaches: createdAttach._id }
    })

    revalidatePath(path)

    } catch(error: any) {
        throw new Error(`Error creating attach: ${error.message}`)
    }
    
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB()

    //calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize

    // Fetch the post that have no parents (top-level attaches)
    const postsQuery = Attach.find({
        parentId: { $in: [null, undefined]}
    })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({ path: 'children', 
     populate: { path: 'author', model: User, select: "_id name parentId image"}})

     const totalPostsCount = await Attach.countDocuments({ parentId: { $in: [null, undefined]} })

     const posts = await postsQuery.exec()

     const isNext = totalPostsCount > skipAmount + posts.length

     return { posts, isNext }
}

export async function fetchAttachById(id: string) {
    connectToDB()

    try {
        //populate groups
        const attach = await Attach.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image",
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Attach,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                },
            ]
        }).exec()

        return attach

    } catch(error: any) {
        throw new Error(`Error fetching attach: ${error.message}`)
    }
}

export async function addCommentToAttach(
    attachId: string,
    commentText: string,
    userId: string,
    path: string
    ) {
        try {

            const originalAttach = await Attach.findById(attachId)

            if(!originalAttach) {
                throw new Error("Attach not found")
            }

            const commentAttach = new Attach ({
                text: commentText,
                author: userId,
                parentId: attachId
            })

            const savedCommentAttach = await commentAttach.save()

            originalAttach.children.push(savedCommentAttach._id)

            await originalAttach.save()

            revalidatePath(path)


        } catch(error: any) {
            throw new Error(`Error adding comment to attach: ${error.message}`)
        }
}