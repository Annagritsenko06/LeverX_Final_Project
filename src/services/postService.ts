import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../common/fileHelpers.js';
import { POSTSMESSAGES, MESSAGES } from '../common/messages.js';
import type { Post, CreatePostInput, User } from '../types/types.js';

export async function createPost(
    authorId: string,
    postData: CreatePostInput
): Promise<{ title: string; created_date: Date }> {
    const { title, description } = postData;

    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);

    const created_date = new Date();
    const postId = randomUUID();

    const newPost: Post = {
        authorId,
        postId: postId,
        title,
        description,
        createdData: created_date,
    };

    posts.push(newPost);
    await writeFile(process.env.POSTS_FILE as string, posts);

    return { title, created_date };
}

export async function getUserPosts(userId: string): Promise<
    {
        title: string;
        description: string;
        created_data: Date | string;
        author: string;
    }[]
> {
    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const users = await readFile<User[]>(process.env.DATA_FILE as string);

    const userPosts = posts.filter((post) => post.authorId === userId);

    return userPosts.map((post) => {
        const author = users.find((u) => u.id === post.authorId);
        return {
            title: post.title,
            description: post.description,
            created_data: post.createdData,
            author: author
                ? `${author.name} ${author.lastname}`
                : MESSAGES.UNKNOWN_AUTHOR,
        };
    });
}

export async function updatePost(
    postId: string,
    authorId: string,
    updateData: { title: string; description: string }
): Promise<{ title: string; updated_date: Date }> {
    const { title, description } = updateData;

    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const postIndex = posts.findIndex(
        (post) => post.authorId === authorId && post.postId === postId
    );

    if (postIndex === -1) {
        throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const updated_date = new Date();
    posts[postIndex] = {
        ...posts[postIndex],
        title,
        description,
        updatedData: new Date(),
    };
    await writeFile(process.env.POSTS_FILE as string, posts);

    return { title, updated_date };
}

export async function deletePost(
    postId: string,
    authorId: string
): Promise<boolean> {
    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const postIndex = posts.findIndex(
        (post) => post.postId === postId && post.authorId === authorId
    );

    if (postIndex === -1) {
        throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    posts.splice(postIndex, 1);
    await writeFile(process.env.POSTS_FILE as string, posts);

    return true;
}
