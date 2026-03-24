import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VinylsService } from './vinyls.service';
import { VINYLSMESSAGES } from '../common/messages';
import { AuthGuard } from '../auth/auth.guard';
import { CreateVinylDto } from './dto/create-vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/guards/roles.decorators.js';
import { RolesGuard } from '../auth/guards/role.guard.js';

@ApiTags('vinyls')
@ApiBearerAuth()
@Controller('vinyls')
export class VinylsController {
  constructor(private readonly vinylsService: VinylsService) {}

  @Post('/')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Create vinyl' })
  async createVinyl(@Req() req: Request, @Body() vinylBody: CreateVinylDto) {
    const result = await this.vinylsService.createVinyl(vinylBody);
    return {
      success: true,
      message: VINYLSMESSAGES.VINYL_CREATED,
      name: result.name,
      price: result.price,
      authorName: result.authorName,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Find vinyls' })
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
    example: 'Abbey Road',
    description: 'Search vinyls by name',
  })
  @ApiQuery({
    name: 'authorName',
    type: String,
    required: false,
    example: 'The Beatles',
    description: 'Search vinyls by author name',
  })
  async searchVinyls(
    @Query('name') name?: string,
    @Query('authorName') authorName?: string,
  ) {
    const vinyls = await this.vinylsService.searchVinyls(name, authorName);
    return {
      success: true,
      vinyls: vinyls,
    };
  }

  @Get('filter')
  @ApiOperation({ summary: 'Sort vinyls of user' })
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    description: 'Number of items to return per page',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Page number (starting from 1)',
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    required: false,
    example: 'price',
    description: 'Field to sort by: "price", "name" or "authorName"',
    schema: {
      enum: ['price', 'name', 'authorName'],
    },
  })
  @ApiQuery({
    name: 'sortOrder',
    type: String,
    required: false,
    example: 'ASC',
    description: 'Sort order: "ASC" (ascending) or "DESC" (descending)',
    schema: {
      enum: ['ASC', 'DESC'],
    },
  })
  async filterVinyls(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'price' | 'name' | 'authorName',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const vinyls = await this.vinylsService.filterVinyls({
      page: page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    return {
      success: true,
      vinyls: vinyls,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all vinyls' })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    description: 'Number of items to return per page',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Page number (starting from 1)',
  })
  async getVinyls(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const resolvedPage = Number(page) || 1;
    const resolvedLimit = Number(limit) || 10;
    const vinyls = await this.vinylsService.getVinyls({
      page: resolvedPage,
      limit: resolvedLimit,
    });
    return {
      success: true,
      vinyls: vinyls,
    };
  }

  @Put(':vinylId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Update vinyl' })
  async updateVinyl(
    @Req() req: Request,
    @Param('vinylId') vinylId: string,
    @Body() vinylBody: UpdateVinylDto,
  ) {
    const result = await this.vinylsService.updateVinyl(vinylId, vinylBody);

    return {
      success: true,
      message: VINYLSMESSAGES.VINYL_UPDATED,
      name: result.name,
      price: result.price,
    };
  }

  @Delete(':vinylId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Delete vinyl' })
  async deleteVinyl(@Req() req: Request, @Param('vinylId') vinylId: string) {
    await this.vinylsService.deleteVinyl(vinylId);

    return {
      success: true,
      message: VINYLSMESSAGES.VINYL_DELETED,
    };
  }
}
