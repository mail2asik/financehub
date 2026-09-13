import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, AddContributionDto } from './dto/goal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiMessage('Goal created successfully')
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(req.user.id, dto);
  }

  @Get()
  @ApiMessage('Fetched goals successfully')
  findAll(@Request() req: AuthenticatedRequest) {
    return this.goalsService.findAllByUser(req.user.id);
  }

  @Post(':id/contribute')
  @ApiMessage('Contribution added successfully')
  addContribution(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddContributionDto,
  ) {
    return this.goalsService.addContribution(req.user.id, id, dto);
  }
}