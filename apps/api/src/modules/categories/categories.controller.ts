import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
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
  @ApiMessage('Category created successfully')
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, dto);
  }

  @Get()
  @ApiMessage('Fetched categories successfully')
  findAll(@Request() req: AuthenticatedRequest) {
    return this.categoriesService.findAllByUser(req.user.id);
  }

  @Patch(':id')
  @ApiMessage('Category updated successfully')
  update(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCategoryDto,
    @Param('id') id: string,
  ) {
    return this.categoriesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiMessage('Category deleted successfully')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.id, id);
  }
}
