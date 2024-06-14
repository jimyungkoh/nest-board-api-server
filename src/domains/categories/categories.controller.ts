import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get(':name')
  getCategoryByName(@Query('name') name: string) {
    return this.categoriesService.findCategoryBy({ name });
  }

  @Get()
  getCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Put(':name')
  updateCategory(
    @Query('name') name: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategoryBy({ name }, updateCategoryDto);
  }

  @Delete(':name')
  deleteCategory(@Query('name') name: string) {
    return this.categoriesService.deleteCategoryBy({ name });
  }
}
