import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from '@sequelize/core';

export class PurchasedVinyl extends Model<
  InferAttributes<PurchasedVinyl>,
  InferCreationAttributes<PurchasedVinyl>
> {
  declare userId: string;
  declare vinylId: string;
  declare purchasedAt: CreationOptional<Date>;
}

export function initPurchasedVinylModel(sequelize: Sequelize) {
  PurchasedVinyl.init(
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      vinylId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      purchasedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'userVinyls',
      timestamps: false,
    },
  );
}
