import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiMessage('Fetched dashboard summary successfully')
  getSummary(@Request() req) {
    return this.dashboardService.getSummary(req.user.id);
  }
}