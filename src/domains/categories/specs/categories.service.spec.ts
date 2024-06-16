import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { Category } from '../entities';
import {
  CategoryAlreadyExistsException,
  CategoryNotFoundException,
} from '../exceptions';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  describe('createCategory', () => {
    test('새로운 카테고리를 생성해야 한다', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'New Category' };
      const savedCategory = { id: 1, ...createCategoryDto };

      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(undefined);
      jest
        .spyOn(categoriesRepository, 'save')
        .mockResolvedValue(savedCategory as Category);

      const result = await service.createCategory(createCategoryDto);

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        name: createCategoryDto.name,
      });
      expect(categoriesRepository.save).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(savedCategory);
    });

    test('카테고리가 이미 존재할 경우 CategoryAlreadyExistsException을 발생시켜야 한다', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Existing Category',
      };
      const existingCategory = { id: 1, ...createCategoryDto };

      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(existingCategory as Category);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        CategoryAlreadyExistsException,
      );
      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        name: createCategoryDto.name,
      });
    });
  });

  describe('findCategoryBy', () => {
    test('ID로 카테고리를 찾아야 한다', async () => {
      const categoryId = 1;
      const category = { id: categoryId, name: 'Category' };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);

      const result = await service.findCategoryBy({ id: categoryId });

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        id: categoryId,
      });
      expect(result).toEqual(category);
    });

    test('이름으로 카테고리를 찾아야 한다', async () => {
      const categoryName = 'Category';
      const category = { id: 1, name: categoryName };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);

      const result = await service.findCategoryBy({ name: categoryName });

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        name: categoryName,
      });
      expect(result).toEqual(category);
    });

    test('카테고리를 찾을 수 없는 경우 CategoryNotFoundException을 발생시켜야 한다', async () => {
      const criteria = { id: 1 };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(undefined);

      await expect(service.findCategoryBy(criteria)).rejects.toThrow(
        CategoryNotFoundException,
      );
      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith(criteria);
    });
  });

  describe('findAllCategories', () => {
    test('모든 카테고리를 찾아야 한다', async () => {
      const categories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      jest
        .spyOn(categoriesRepository, 'find')
        .mockResolvedValue(categories as Category[]);

      const result = await service.findAllCategories();

      expect(categoriesRepository.find).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('updateCategoryBy', () => {
    test('ID로 카테고리를 업데이트해야 한다', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const category = { id: categoryId, name: 'Category' };
      const updatedCategory = { ...category, ...updateCategoryDto };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);
      jest
        .spyOn(categoriesRepository, 'save')
        .mockResolvedValue(updatedCategory as Category);

      const result = await service.updateCategoryBy(
        { id: categoryId },
        updateCategoryDto,
      );

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        id: categoryId,
      });
      expect(categoriesRepository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });

    test('이름으로 카테고리를 업데이트해야 한다', async () => {
      const categoryName = 'Category';
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const category = { id: 1, name: categoryName };
      const updatedCategory = { ...category, ...updateCategoryDto };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);
      jest
        .spyOn(categoriesRepository, 'save')
        .mockResolvedValue(updatedCategory as Category);

      const result = await service.updateCategoryBy(
        { name: categoryName },
        updateCategoryDto,
      );

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        name: categoryName,
      });
      expect(categoriesRepository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });

    test('카테고리를 찾을 수 없는 경우 CategoryNotFoundException을 발생시켜야 한다', async () => {
      const criteria = { id: 1 };
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(undefined);

      await expect(
        service.updateCategoryBy(criteria, updateCategoryDto),
      ).rejects.toThrow(CategoryNotFoundException);
      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith(criteria);
    });
  });

  describe('deleteCategoryBy', () => {
    test('ID로 카테고리를 삭제해야 한다', async () => {
      const categoryId = 1;
      const category = { id: categoryId, name: 'Category' };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);
      jest
        .spyOn(categoriesRepository, 'softDelete')
        .mockResolvedValue(undefined);

      await service.deleteCategoryBy({ id: categoryId });

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        id: categoryId,
      });
      expect(categoriesRepository.softDelete).toHaveBeenCalledWith(categoryId);
    });

    test('이름으로 카테고리를 삭제해야 한다', async () => {
      const categoryName = 'Category';
      const category = { id: 1, name: categoryName };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(category as Category);
      jest
        .spyOn(categoriesRepository, 'softDelete')
        .mockResolvedValue(undefined);

      await service.deleteCategoryBy({ name: categoryName });

      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
        name: categoryName,
      });
      expect(categoriesRepository.softDelete).toHaveBeenCalledWith(category.id);
    });

    test('카테고리를 찾을 수 없는 경우 CategoryNotFoundException을 발생시켜야 한다', async () => {
      const criteria = { id: 1 };
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(undefined);

      await expect(service.deleteCategoryBy(criteria)).rejects.toThrow(
        CategoryNotFoundException,
      );
      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith(criteria);
    });
  });
});
