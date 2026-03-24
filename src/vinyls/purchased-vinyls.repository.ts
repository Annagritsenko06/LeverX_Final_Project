import { Injectable } from '@nestjs/common';
import type { InferAttributes } from '@sequelize/core';
import { PurchasedVinyl } from '../common/db/models/purchased-vinyl.model';

@Injectable()
export class PurchasedVinylsRepository {
  async createPurchase(
    userId: string,
    vinylId: string,
  ): Promise<InferAttributes<PurchasedVinyl>> {
    const purchase = await PurchasedVinyl.create({ userId, vinylId });
    return purchase.toJSON();
  }

  async getUserPurchases(userId: string): Promise<PurchasedVinyl[]> {
    return await PurchasedVinyl.findAll({ where: { userId } });
  }

  async isPurchased(userId: string, vinylId: string): Promise<boolean> {
    const purchase = await PurchasedVinyl.findOne({
      where: { userId, vinylId },
    });
    return purchase !== null;
  }
}
