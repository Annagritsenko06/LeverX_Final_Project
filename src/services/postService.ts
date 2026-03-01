import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../common/fileHelpers.js';
import { POSTSMESSAGES, MESSAGES } from '../common/messages.js';
import type { Post, CreatePostInput, User } from '../types/types.js';

export async function createPost(
    authorId: string,
    postData: CreatePostInput
): Promise<{ Title: string; created_date: Date }> {
    const { Title, Description } = postData;

    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);

    const created_date = new Date();
    const postId = randomUUID();

    const newPost: Post = {
        authorId,
        Post_id: postId,
        Title,
        Description,
        Created_data: created_date,
    };

    posts.push(newPost);
    await writeFile(process.env.POSTS_FILE as string, posts);

    return { Title, created_date };
}

export async function getUserPosts(
    userId: string
): Promise<
    {
        Title: string;
        Description: string;
        Created_data: Date | string;
        Author: string;
    }[]
> {
    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const users = await readFile<User[]>(process.env.DATA_FILE as string);

    const userPosts = posts.filter((post) => post.authorId === userId);

    return userPosts.map((post) => {
        const author = users.find((u) => u.Id === post.authorId);
        return {
            Title: post.Title,
            Description: post.Description,
            Created_data: post.Created_data,
            Author: author
                ? `${author.Name} ${author.Lastname}`
                : MESSAGES.UNKNOWN_AUTHOR,
        };
    });
}

export async function updatePost(
    postId: string,
    authorId: string,
    updateData: { Title: string; Description: string }
): Promise<{ Title: string; updated_date: Date }> {
    const { Title, Description } = updateData;

    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const postIndex = posts.findIndex(
        (post) => post.authorId === authorId && post.Post_id === postId
    );

    if (postIndex === -1) {
        throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const updated_date = new Date();
    posts[postIndex].Title = Title;
    posts[postIndex].Description = Description;
    posts[postIndex].Updated_data = updated_date;

    await writeFile(process.env.POSTS_FILE as string, posts);

    return { Title, updated_date };
}

export async function deletePost(
    postId: string,
    authorId: string
): Promise<boolean> {
    const posts = await readFile<Post[]>(process.env.POSTS_FILE as string);
    const postIndex = posts.findIndex(
        (post) => post.Post_id === postId && post.authorId === authorId
    );

    if (postIndex === -1) {
        throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    posts.splice(postIndex, 1);
    await writeFile(process.env.POSTS_FILE as string, posts);

    return true;
}
