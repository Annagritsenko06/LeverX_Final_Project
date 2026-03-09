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
} from '@sequelize/core/decorators-legacy';
import { v4 as uuidv4 } from 'uuid';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @PrimaryKey
  @Attribute(DataTypes.UUIDV4)
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
}
