import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiMessage('Account created successfully')
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.user.id, dto);
  }

  @Get()
  @ApiMessage('Fetched accounts successfully')
  findAll(@Request() req: AuthenticatedRequest) {
    return this.accountsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiMessage('Fetched account successfully')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.accountsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiMessage('Account updated successfully')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiMessage('Account archived successfully')
  archive(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.accountsService.archive(req.user.id, id);
  }
}