import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from '@sequelize/core';
import type { CreationOptional } from '@sequelize/core';
import {
  Attribute,
  PrimaryKey,
  NotNull,
  Default,
  BelongsTo,
} from '@sequelize/core/decorators-legacy';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.model';
export class Post extends Model<
  InferAttributes<Post>,
  InferCreationAttributes<Post>
> {
  @Attribute(DataTypes.UUID)
  declare authorId: string;

  @PrimaryKey
  @Attribute(DataTypes.UUID)
  @Default(uuidv4)
  postId: CreationOptional<string>;

  @NotNull
  @Attribute(DataTypes.STRING)
  title: string;

  @Attribute(DataTypes.TEXT('long'))
  description: string;

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare createdData: CreationOptional<Date>;

  @Attribute(DataTypes.JSON)
  declare likes: string[];

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare updatedData: CreationOptional<Date>;

  declare user?: User;
}
