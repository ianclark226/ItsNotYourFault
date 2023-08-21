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