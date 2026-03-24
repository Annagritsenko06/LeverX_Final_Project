import { Module } from '@nestjs/common';
import { VinylsController } from './vinyls.controller';
import { VinylsService } from './vinyls.service';
import { VinylsRepository } from './vinyls.repository';
import { LoggerModule } from '../common/logger.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LoggerModule, AuthModule],
  controllers: [VinylsController],
  providers: [VinylsService, VinylsRepository],
  exports: [VinylsService, VinylsRepository],
})
export class VinylsModule {}
