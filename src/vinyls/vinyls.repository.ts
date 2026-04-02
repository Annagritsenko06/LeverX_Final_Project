import { Injectable } from '@nestjs/common';
import type { WhereOptions } from '@sequelize/core';
import type { Vinyl as VinylType, CreateVinylInput } from '../types/types';
import { Vinyl } from '../common/db/models/vinyl.model';
import { PurchasedVinyl } from '../common/db/models/purchased-vinyl.model';
@Injectable()
export class VinylsRepository {
  async addVinyl(vinyl: CreateVinylInput): Promise<VinylType> {
    const newVinul = await Vinyl.create({
      name: vinyl.name,
      description: vinyl.description,
      price: vinyl.price,
      authorName: vinyl.authorName,
      image: vinyl.image,
      firstReview: '',
      averageScope: 0,
    });

    return newVinul;
  }
  async updateVunyl(
    vinylId: string,
    name: string,
    description: string,
    price: number,
    authorName: string,
    image: string,
  ): Promise<VinylType | null> {
    await Vinyl.update(
      {
        name: name,
        description: description,
        price: price,
        authorName: authorName,
        image: image,
      },
      {
        where: { vinylId: vinylId },
      },
    );
    return await Vinyl.findOne({
      where: { vinylId: vinylId },
    });
  }
  async searchVinylByName(
    name?: string | null,
    authorName?: string | null,
  ): Promise<VinylType | null> {
    let where: WhereOptions<Vinyl>;

    if (name && authorName) {
      where = { name, authorName };
    } else if (name) {
      where = { name };
    } else if (authorName) {
      where = { authorName };
    } else {
      return null;
    }

    const vinyl = await Vinyl.findOne({
      where,
    });

    if (!vinyl) return null;
    return vinyl.toJSON() as VinylType;
  }

  async findVinylById(vinylId: string): Promise<VinylType | null> {
    const vinyl = await Vinyl.findOne({
      where: { vinylId: vinylId },
    });
    if (!vinyl) return null;
    return vinyl.toJSON() as VinylType;
  }
  async deleteVinyl(vinylId: string): Promise<number> {
    return await Vinyl.destroy({
      where: { vinylId: vinylId },
    });
  }
  async getAllVinyls(): Promise<VinylType[]> {
    return await Vinyl.findAll();
  }

  async updateVinylStats(
    vinylId: string,
    averageScope: number,
    firstReview: string,
  ): Promise<void> {
    await Vinyl.update(
      { averageScope: parseFloat(averageScope.toFixed(2)), firstReview },
      { where: { vinylId } },
    );
  }

  async addPurchaseVinyl(
    userId: string,
    vinylName: string,
  ): Promise<{ purchasedAt: Date } | null> {
    const vinyl = await this.searchVinylByName(vinylName);
    if (!vinyl) return null;
    const purchaseVinyl = await PurchasedVinyl.create({
      userId,
      vinylId: vinyl.vinylId,
    });
    return { purchasedAt: purchaseVinyl.purchasedAt };
  }
}
