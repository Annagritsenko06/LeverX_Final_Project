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
  HasMany,
} from '@sequelize/core/decorators-legacy';
import { v4 as uuidv4 } from 'uuid';
import { Post } from './post.model';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @PrimaryKey
  @Attribute(DataTypes.UUID)
  @Default(uuidv4)
  declare id: CreationOptional<string>;

  @NotNull
  @Attribute(DataTypes.STRING(100))
  declare name: string;

  @Attribute(DataTypes.STRING(100))
  declare lastname: string;

  @NotNull
  @Attribute(DataTypes.STRING(100))
  declare email: string;

  @NotNull
  @Attribute(DataTypes.STRING(100))
  declare password: string;

  @HasMany(() => Post, {
    foreignKey: 'authorId',
  })
  declare Post?: Post[];
}
