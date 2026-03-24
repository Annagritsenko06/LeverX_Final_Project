import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from '@sequelize/core';

export class Vinyl extends Model<
  InferAttributes<Vinyl>,
  InferCreationAttributes<Vinyl>
> {
  declare vinylId: CreationOptional<string>;
  declare authorName: string;
  declare name: string;
  declare description: string;
  declare price: number;
  declare firstReview: string;
  declare averageScope: number;
  declare image: string;
}

export function initVinylModel(sequelize: Sequelize) {
  Vinyl.init(
    {
      vinylId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      authorName: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
      },
      firstReview: {
        type: DataTypes.STRING,
      },
      averageScope: {
        type: DataTypes.DECIMAL(3, 2),
      },
      image: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'vinyls',
      timestamps: false,
    },
  );
}
