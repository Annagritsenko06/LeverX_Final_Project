import { Injectable } from '@nestjs/common';
import type { Post as PostType, CreatePostInput } from '../types/types.ts';
import { Post } from '../common/db/models/post.model.js';
import { POSTSMESSAGES } from '../common/messages.js';
import { User } from '../common/db/models/user.model.js';

@Injectable()
export class PostsRepository {
  async addPost(post: CreatePostInput): Promise<PostType> {
    const newPost = await Post.create({
      authorId: post.authorId,
      title: post.title,
      description: post.description,
      likes: [],
    });
    return newPost;
  }

  async updatePost(
    postId: string,
    title: string,
    description: string,
  ): Promise<PostType | null> {
    await Post.update(
      {
        title: title,
        description: description,
      },
      {
        where: { postId },
      },
    );
    return await Post.findOne({
      where: { postId },
    });
  }

  async findPostById(
    authorId: string,
    postId: string,
  ): Promise<PostType | null> {
    const post = await Post.findOne({
      where: { authorId, postId },
    });
    if (!post) return null;
    return post.toJSON() as PostType;
  }
  async deletePost(postId: string): Promise<number> {
    return await Post.destroy({
      where: { postId },
    });
  }
  async getAllPosts(authorId: string): Promise<PostType[]> {
    return await Post.findAll({
      where: { authorId },
      include: [
        {
          model: User,
          attributes: ['name', 'lastname'],
        },
      ],
    });
  }

  async addLike(postId: string, userId: string): Promise<PostType | null> {
    const post = await Post.findOne({
      where: { postId },
    });

    if (post === null) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = post?.likes ?? [];
    if (!likes.includes(userId)) {
      await post.update({
        likes: [...likes, userId],
      });
    }
    return post;
  }

  async deleteLike(postId: string, userId: string): Promise<PostType | null> {
    const post = await Post.findOne({
      where: { postId },
    });

    if (post === null) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = post?.likes ?? [];
    const updatedLikes = likes.filter((like) => like != userId);
    await post.update({
      likes: updatedLikes,
    });

    return post;
  }
}
