import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

// CategoriesService를 모킹하기 위한 Mock 객체 생성
const mockCategoriesService = {
  createCategory: jest.fn(),
  findCategoryBy: jest.fn(),
  findAllCategories: jest.fn(),
  updateCategoryBy: jest.fn(),
  deleteCategoryBy: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('컨트롤러가 정의되어야 함', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    test('카테고리를 생성해야 함', () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      controller.createCategory(createCategoryDto);
      expect(mockCategoriesService.createCategory).toHaveBeenCalledWith(
        createCategoryDto,
      );
    });
  });

  describe('getCategoryByName', () => {
    test('이름으로 카테고리를 가져와야 함', () => {
      const name = 'Test Category';
      controller.getCategoryByName(name);
      expect(mockCategoriesService.findCategoryBy).toHaveBeenCalledWith({
        name,
      });
    });
  });

  describe('getCategories', () => {
    test('모든 카테고리를 가져와야 함', () => {
      controller.getCategories();
      expect(mockCategoriesService.findAllCategories).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    test('카테고리를 업데이트해야 함', () => {
      const name = 'Test Category';
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      controller.updateCategory(name, updateCategoryDto);
      expect(mockCategoriesService.updateCategoryBy).toHaveBeenCalledWith(
        { name },
        updateCategoryDto,
      );
    });
  });

  describe('deleteCategory', () => {
    test('카테고리를 삭제해야 함', () => {
      const name = 'Test Category';
      controller.deleteCategory(name);
      expect(mockCategoriesService.deleteCategoryBy).toHaveBeenCalledWith({
        name,
      });
    });
  });
});
