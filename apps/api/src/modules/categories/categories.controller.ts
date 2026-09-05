import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.categoriesService.findAllByUser(req.user.id);
  }
}
