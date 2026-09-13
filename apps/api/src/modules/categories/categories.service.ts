import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
      },
    });
  }

  async findAllByUser(userId: string) {
    // Return both default system categories (userId = null) and custom user categories
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(userId: string, categoryId: string, dto: CreateCategoryDto) {
    return this.prisma.category.updateMany({
      where: {
        id: categoryId,
        userId,
      },
      data: {
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
      },
    });
  }

  async remove(userId: string, categoryId: string) {
    return this.prisma.category.deleteMany({
      where: {
        id: categoryId,
        userId,
      },
    });
  }
}
