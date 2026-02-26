import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../utils/fileHelpers.js';
import { POSTS_FILE, DATA_FILE } from '../config/constants.js';

export async function createPost(authorId, postData) {
    const { Title, Description } = postData;

    const posts = await readFile(POSTS_FILE);

    const created_date = new Date();
    const postId = randomUUID();

    const newPost = {
        authorId,
        Post_id: postId,
        Title,
        Description,
        Created_data: created_date,
    };

    posts.push(newPost);
    await writeFile(POSTS_FILE, posts);

    return { Title, created_date };
}

export async function getUserPosts(userId) {
    const posts = await readFile(POSTS_FILE);
    const users = await readFile(DATA_FILE);

    const userPosts = posts.filter((post) => post.authorId === userId);

    return userPosts.map((post) => {
        const author = users.find((u) => u.Id === post.authorId);
        return {
            Title: post.Title,
            Description: post.Description,
            Created_data: post.Created_data,
            Author: author
                ? `${author.Name} ${author.Lastname}`
                : 'Unknown author',
        };
    });
}

export async function updatePost(postId, authorId, updateData) {
    const { Title, Description } = updateData;

    const posts = await readFile(POSTS_FILE);
    const postIndex = posts.findIndex(
        (post) => post.authorId === authorId && post.Post_id === postId
    );

    if (postIndex === -1) {
        throw new Error('Post not found');
    }

    const updated_date = new Date();
    posts[postIndex].Title = Title;
    posts[postIndex].Description = Description;
    posts[postIndex].Updated_data = updated_date;

    await writeFile(POSTS_FILE, posts);

    return { Title, updated_date };
}

export async function deletePost(postId, authorId) {
    const posts = await readFile(POSTS_FILE);
    const postIndex = posts.findIndex(
        (post) => post.Post_id === postId && post.authorId === authorId
    );

    if (postIndex === -1) {
        throw new Error('Post not found');
    }

    posts.splice(postIndex, 1);
    await writeFile(POSTS_FILE, posts);

    return true;
}
