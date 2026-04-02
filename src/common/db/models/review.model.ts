import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from '@sequelize/core';
import { User } from './user.model.js';

export class Review extends Model<
  InferAttributes<Review>,
  InferCreationAttributes<Review>
> {
  declare reviewId: CreationOptional<string>;
  declare userId: string;
  declare vinylId: string;
  declare comment: string;
  declare reviewScore: number;
  declare user?: User;
}

export function initReviewModel(sequelize: Sequelize) {
  Review.init(
    {
      reviewId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      vinylId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reviewScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'reviews',
      timestamps: false,
    },
  );
}
