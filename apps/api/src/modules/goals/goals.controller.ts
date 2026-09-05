import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, AddContributionDto } from './dto/goal.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAllByUser(req.user.id);
  }

  @Post(':id/contribute')
  addContribution(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddContributionDto,
  ) {
    return this.goalsService.addContribution(req.user.id, id, dto);
  }
}