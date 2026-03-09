import { User } from './user.model';
import { Post } from './post.model';

export function setupAssociations() {
  User.hasMany(Post, {
    foreignKey: 'authorId',
  });

  Post.belongsTo(User, {
    foreignKey: 'authorId',
  });
}
