import { Injectable } from '@nestjs/common';
import { Post } from './models/post.model';
import { User } from './models/user.model';
import type {
  RegisterUserInput,
  User as UserType,
  CreatePostInput,
  Post as PostType,
} from '../types/types';
import { POSTSMESSAGES } from './messages';
@Injectable()
export class DataRepository {
  async addUser(user: RegisterUserInput): Promise<UserType> {
    const createdUser = await User.create({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    });

    return createdUser.toJSON() as UserType;
  }
  async updateUser(
    name: string,
    lastname: string,
    email: string,
  ): Promise<boolean> {
    const [updatedCount] = await User.update(
      {
        name: name,
        lastname: lastname,
      },
      {
        where: { email },
      },
    );
    return updatedCount > 0;
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) return null;
    return user.toJSON() as UserType;
  }

  async findUserById(id: string): Promise<UserType | null> {
    const user = await User.findOne({
      where: { id },
    });
    if (!user) return null;
    return user.toJSON() as UserType;
  }
  async addPost(post: CreatePostInput): Promise<Post> {
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
    const updatedLikes = likes.filter((like) => userId != userId);
    await post.update({
      likes: updatedLikes,
    });

    return post;
  }
}
