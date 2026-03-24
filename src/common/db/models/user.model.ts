import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from '@sequelize/core';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare roleId: CreationOptional<string>;
  declare name: string;
  declare lastname: string;
  declare email: string;
  declare googleSub?: string;
  declare birthdate?: CreationOptional<Date>;
  declare avatar?: string;
  declare sessionVersion?: CreationOptional<number>;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      roleId: {
        type: DataTypes.STRING,
        defaultValue: 'user',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      googleSub: {
        type: DataTypes.STRING,
      },
      birthdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      sessionVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false,
    },
  );
}
