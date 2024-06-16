import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities/category.entity';
import {
  CategoryAlreadyExistsException,
  CategoryNotFoundException,
} from './exceptions';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const category = await this.categoriesRepository.findOneBy({ name });

    if (category) throw new CategoryAlreadyExistsException();

    return await this.categoriesRepository.save(createCategoryDto);
  }

  async findCategoryBy(criteria: { id: number } | { name: string }) {
    const category = await this.categoriesRepository.findOneBy({
      ...criteria,
    });

    if (!category) throw new CategoryNotFoundException();

    return category;
  }

  async findAllCategories() {
    const categories = await this.categoriesRepository.find();
    return categories;
  }

  async updateCategoryBy(
    criteria: { id: number } | { name: string },
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesRepository.findOneBy({
      ...criteria,
    });

    if (!category) throw new CategoryNotFoundException();

    const updatedCategory = { ...category, ...updateCategoryDto };

    return await this.categoriesRepository.save(updatedCategory);
  }

  async deleteCategoryBy(criteria: { id: number } | { name: string }) {
    const category = await this.categoriesRepository.findOneBy({
      ...criteria,
    });

    if (!category) throw new CategoryNotFoundException();

    return await this.categoriesRepository.softDelete(category.id);
  }
}
