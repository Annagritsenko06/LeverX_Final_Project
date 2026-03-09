import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../db';
export const up = async ({ context: qi }: any) => {
  const users = Array.from({ length: 10 }).map((_, i) => ({
    id: uuidv4(),
    name: `User${i + 1}`,
    lastname: `Lastname${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: 'hashed-password',
  }));

  await sequelize.getQueryInterface().bulkInsert('users', users, {});

  const posts = users.map((u, i) => ({
    postId: uuidv4(),
    authorId: u.id,
    title: `Post ${i + 1}`,
    description: `Description ${i + 1}`,
    createdData: new Date(),
    updatedData: new Date(),
    likes: JSON.stringify([]),
  }));

  await sequelize.getQueryInterface().bulkInsert('posts', posts, {});
};

export const down = async ({ context: qi }: any) => {
  await qi.bulkDelete('posts', {}, {});
  await qi.bulkDelete('users', {}, {});
};
