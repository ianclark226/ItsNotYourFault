"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Attach from "../models/attach.model";
import Group from "../models/group.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level attaches) (a attach that is not a comment/reply).
  const postsQuery = Attach.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "group",
      model: Group,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (attaches) i.e., attaches that are not comments.
  const totalPostsCount = await Attach.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string,
  author: string,
  groupId: string | null,
  path: string,
}

export async function createAttach({ text, author, groupId, path }: Params
) {
  try {
    connectToDB();

    const groupIdObject = await Group.findOne(
      { id: groupId },
      { _id: 1 }
    );

    const createdAttach = await Attach.create({
      text,
      author,
      group: groupIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { attaches: createdAttach._id },
    });

    if (groupIdObject) {
      // Update Community model
      await Group.findByIdAndUpdate(groupIdObject, {
        $push: { attaches: createdAttach._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create attach: ${error.message}`);
  }
}

async function fetchAllChildAttaches(attachId: string): Promise<any[]> {
  const childAttaches = await Attach.find({ parentId: attachId });

  const descendantAttaches = [];
  for (const childAttach of childAttaches) {
    const descendants = await fetchAllChildAttaches(childAttach._id);
    descendantAttaches.push(childAttach, ...descendants);
  }

  return descendantAttaches
}

export async function deleteAttach(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainAttach = await Attach.findById(id).populate("author group");

    if (!mainAttach) {
      throw new Error("Attach not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantAttaches = await fetchAllChildAttaches(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantAttachIds = [
      id,
      ...descendantAttaches.map((attach) => attach._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantAttaches.map((attach) => attach.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainAttach.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueGroupIds = new Set(
      [
        ...descendantAttaches.map((attach) => attach.group?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainAttach.group?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Attach.deleteMany({ _id: { $in: descendantAttachIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { attaches: { $in: descendantAttachIds } } }
    );

    // Update Community model
    await Group.updateMany(
      { _id: { $in: Array.from(uniqueGroupIds) } },
      { $pull: { threads: { $in: descendantAttachIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete attach: ${error.message}`);
  }
}

export async function fetchAttachById(attachId: string) {
  connectToDB();

  try {
    const attach = await Attach.findById(attachId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "group",
        model: Group,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Attach, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return attach;
  } catch (err) {
    console.error("Error while fetching attach:", err);
    throw new Error("Unable to fetch attach");
  }
}

export async function addCommentToAttach(
  attachId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original attach by its ID
    const originalAttach = await Attach.findById(attachId);

    if (!originalAttach) {
      throw new Error("Attach not found");
    }

    // Create the new comment attach
    const commentAttach = new Attach({
      text: commentText,
      author: userId,
      parentId: attachId, // Set the parentId to the original attach's ID
    });

    // Save the comment attach to the database
    const savedCommentAttach = await commentAttach.save();

    // Add the comment attach's ID to the original attach's children array
    originalAttach.children.push(savedCommentAttach._id);

    // Save the updated original attach to the database
    await originalAttach.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}