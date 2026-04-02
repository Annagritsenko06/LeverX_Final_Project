import { Injectable } from '@nestjs/common';
import { VINYLSMESSAGES, MESSAGES } from '../common/messages';
import type { UserVinylDto } from '../types/types';
import { VinylsRepository } from './vinyls.repository';
import { BadRequestException } from '@nestjs/common';
import { LoggerService } from '../common/logger';

@Injectable()
export class VinylsService {
  constructor(
    private readonly vinylsRepository: VinylsRepository,
    private readonly logger: LoggerService,
  ) {}

  async createVinyl(vinylData: {
    name: string;
    description: string;
    price: string;
    authorName: string;
    image: string;
  }): Promise<{
    name: string;
    description: string;
    price: number;
    authorName: string;
  }> {
    const { name, description, price, authorName, image } = vinylData;
    const priceRaw = Number(price);

    if (isNaN(priceRaw) || priceRaw <= 0) {
      throw new BadRequestException('Invalid price');
    }

    const createdVinyl = await this.vinylsRepository.addVinyl({
      authorName,
      name,
      description,
      price: priceRaw,
      image: image,
    });
    this.logger.log('Vinyl created', { name, authorName, price: priceRaw });
    return {
      name: createdVinyl.name,
      description: createdVinyl.description,
      price: createdVinyl.price,
      authorName: createdVinyl.authorName,
    };
  }

  async searchVinyls(name?: string, authorName?: string) {
    return await this.vinylsRepository.searchVinylByName(name, authorName);
  }

  async filterVinyls(
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'price' | 'name' | 'authorName';
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<UserVinylDto[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'price',
      sortOrder = 'DESC',
    } = options;

    const allVinuls = await this.vinylsRepository.getAllVinyls();

    const filtered = allVinuls;

    filtered.sort((a, b) => {
      const dir = sortOrder === 'ASC' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * dir;
      } else if (sortBy === 'authorName') {
        return a.authorName.localeCompare(b.authorName) * dir;
      }
      return (a.price - b.price) * dir;
    });

    const offset = (page - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    return paged.map((vinyl) => ({
      name: vinyl.name,
      description: vinyl.description,
      price: vinyl.price,
      authorName: vinyl.User ? `${vinyl.User.name}` : MESSAGES.UNKNOWN_AUTHOR,
      image: vinyl.image,
      firstReview: vinyl.firstReview,
      averageScope: vinyl.averageScope,
    }));
  }

  async getVinyls(
    options: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<UserVinylDto[]> {
    const { page = 1, limit = 10 } = options;

    const allVinyls = await this.vinylsRepository.getAllVinyls();

    const offset = (page - 1) * limit;
    const paged = allVinyls.slice(offset, offset + limit);

    return paged.map((vinyl) => ({
      name: vinyl.name,
      description: vinyl.description,
      price: vinyl.price,
      authorName: vinyl.User ? `${vinyl.User.name}` : MESSAGES.UNKNOWN_AUTHOR,
      image: vinyl.image,
      firstReview: vinyl.firstReview,
      averageScope: vinyl.averageScope,
    }));
  }

  async updateVinyl(
    vinylId: string,
    updateData: {
      name: string;
      description: string;
      price: string;
      authorName: string;
      image: string;
    },
  ): Promise<{
    name: string;
    description: string;
    price: number;
    authorName: string;
    image: string;
  }> {
    const { name, description, price, authorName, image } = updateData;

    const updatedVinyl = await this.vinylsRepository.updateVunyl(
      vinylId,
      name,
      description,
      Number(price),
      authorName,
      image,
    );
    if (!updatedVinyl) {
      throw new Error(VINYLSMESSAGES.VINYL_NOT_FOUND);
    }
    this.logger.log('Vinyl updated', { vinylId, name, price });
    return {
      name: updatedVinyl.name,
      description: updatedVinyl.description,
      price: updatedVinyl.price,
      authorName: updatedVinyl.authorName,
      image: updatedVinyl.image,
    };
  }

  async deleteVinyl(vinylId: string): Promise<boolean> {
    const deletedCount = await this.vinylsRepository.deleteVinyl(vinylId);

    if (deletedCount === 0) {
      throw new Error(VINYLSMESSAGES.VINYL_NOT_FOUND);
    }
    this.logger.log('Vinyl deleted', { vinylId });
    return true;
  }

  async addPurchaseVinyl(
    userId: string,
    vinylName: string,
  ): Promise<{ purchasedAt: Date } | null> {
    const purchasedData = await this.vinylsRepository.addPurchaseVinyl(
      userId,
      vinylName,
    );
    if (!purchasedData) {
      throw Error(VINYLSMESSAGES.VINYL_NOT_FOUND);
    }
    return { purchasedAt: purchasedData.purchasedAt };
  }
}
