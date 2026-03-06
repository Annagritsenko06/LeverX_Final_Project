import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileHelpers } from '../common/fileHelpers';
import type { User } from '../types/types';

@Injectable()
export class UsersRepository {
  private readonly dataFile: string;

  constructor(
    private readonly fileHelpers: FileHelpers,
    private readonly configService: ConfigService,
  ) {
    this.dataFile = this.configService.get<string>('DATA_FILE', {
      infer: true,
    })!;
  }

  findAll(): Promise<User[]> {
    return this.fileHelpers.readFile<User[]>(this.dataFile);
  }

  saveAll(users: User[]): Promise<void> {
    return this.fileHelpers.writeFile(this.dataFile, users);
  }
}

