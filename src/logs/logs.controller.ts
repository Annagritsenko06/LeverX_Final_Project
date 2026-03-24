import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/guards/roles.decorators';
import { ConfigService } from '@nestjs/config';

@ApiTags('logs')
@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get system logs (admin only)' })
  @ApiResponse({ status: 200, description: 'System logs returned' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getLogs() {
    const logFile = this.configService.get<string>('LOG_FILE') ?? 'Logs.json';
    try {
      const raw = readFileSync(logFile, 'utf-8');
      const lines = raw
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => {
          try {
            return JSON.parse(l) as Record<string, unknown>;
          } catch {
            return { raw: l };
          }
        });
      return { success: true, logs: lines };
    } catch {
      return { success: true, logs: [] };
    }
  }
}
