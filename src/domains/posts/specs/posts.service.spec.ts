import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/common/storage/aws-s3.service';
import { Category } from 'src/domains/categories/entities';
import { CategoriesService } from '../../categories/categories.service';
import { User } from '../../users/entities';
import { Image, Post } from '../entities';
import {
  OnlyAuthorCanAccessException,
  PostNotFoundException,
} from '../exceptions';
import { PostsRepository } from '../posts.repository';
import { PostsService } from '../posts.service';

describe('PostsService', () => {
  let postsService: PostsService;
  let postsRepository: PostsRepository;
  let categoriesService: CategoriesService;
  let awsS3Service: AwsS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: {
            createPost: jest.fn(),
            searchPosts: jest.fn(),
            getLatestPosts: jest.fn(),
            getPopularPosts: jest.fn(),
            findPostById: jest.fn(),
            updatePost: jest.fn(),
            softDeletePost: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Image),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AwsS3Service,
          useValue: {
            uploadImageToS3: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findCategoryBy: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postsRepository = module.get<PostsRepository>(PostsRepository);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  describe('createPost', () => {
    test('이미지가 포함된 새 게시물을 생성해야 합니다', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'This is a test post',
        categoryName: 'Test Category',
      };
      const author = { id: 1 } as User;
      const files = [{ buffer: Buffer.from('test') }] as Express.Multer.File[];
      const category = { id: 1, name: 'Test Category' };
      const image = { id: 1, url: 'test-url' };

      jest
        .spyOn(categoriesService, 'findCategoryBy')
        .mockResolvedValueOnce(category as Category);
      jest
        .spyOn(postsService, 'uploadImages')
        .mockResolvedValueOnce([{ url: 'test-url' } as Image]);
      jest
        .spyOn(awsS3Service, 'uploadImageToS3')
        .mockResolvedValueOnce('test-url');
      jest.spyOn(postsRepository, 'createPost').mockResolvedValueOnce({
        id: 1,
        ...createPostDto,
        category: category as Category,
        author,
        images: [image],
      } as unknown as Post);

      const result = await postsService.createPost(
        createPostDto,
        author,
        files,
      );

      expect(categoriesService.findCategoryBy).toHaveBeenCalledWith({
        name: createPostDto.categoryName,
      });
      expect(postsRepository.createPost).toHaveBeenCalledWith(
        {
          title: createPostDto.title,
          content: createPostDto.content,
          category,
        },
        [{ url: 'test-url' }],
        author,
      );

      expect(result).toEqual({
        id: 1,
        ...createPostDto,
        category,
        author,
        images: [image],
      });
    });
  });

  describe('getPostById', () => {
    test('ID로 게시물을 반환해야 합니다', async () => {
      const postId = 1;
      const post = { id: postId, title: 'Test Post' };

      jest
        .spyOn(postsRepository, 'findPostById')
        .mockResolvedValueOnce(post as Post);

      const result = await postsService.getPostById(postId);

      expect(postsRepository.findPostById).toHaveBeenCalledWith(postId);
      expect(result).toEqual(post);
    });

    test('게시물을 찾을 수 없는 경우 PostNotFoundException을 발생시켜야 합니다', async () => {
      const postId = 1;

      jest
        .spyOn(postsRepository, 'findPostById')
        .mockResolvedValueOnce(undefined);

      await expect(postsService.getPostById(postId)).rejects.toThrow(
        PostNotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    test('게시물을 업데이트해야 합니다', async () => {
      const postId = 1;
      const updatePostDto = { title: 'Updated Post' };
      const user = { id: 1 } as User;
      const post = { id: postId, title: 'Test Post', author: user };
      const updatedPost = { id: postId, ...updatePostDto };

      jest
        .spyOn(postsRepository, 'findPostById')
        .mockResolvedValueOnce(post as Post);
      jest
        .spyOn(postsRepository, 'updatePost')
        .mockResolvedValueOnce(updatedPost as Post);

      const result = await postsService.updatePost(
        postId,
        updatePostDto,
        user,
        [],
      );
      expect(postsRepository.findPostById).toHaveBeenCalledWith(postId);
      expect(postsRepository.updatePost).toHaveBeenCalledWith(
        postId,
        { ...post, ...updatePostDto },
        [],
      );
      expect(result).toEqual(updatedPost);
    });

    test('사용자가 게시물의 저자가 아닌 경우 OnlyAuthorCanAccessException을 발생시켜야 합니다', async () => {
      const postId = 1;
      const updatePostDto = { title: 'Updated Post' };
      const user = { id: 1 } as User;
      const post = { id: postId, title: 'Test Post', author: { id: 2 } };

      jest
        .spyOn(postsRepository, 'findPostById')
        .mockResolvedValueOnce(post as Post);

      await expect(
        postsService.updatePost(postId, updatePostDto, user),
      ).rejects.toThrow(OnlyAuthorCanAccessException);
    });
  });

  describe('deletePost', () => {
    test('게시물을 삭제해야 합니다', async () => {
      const postId = 1;
      const user = { id: 1 } as User;
      const post = { id: postId, title: 'Test Post', author: user };

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValueOnce({
        ...post,
        category: { name: '자유게시판' },
      } as Post);
      jest.spyOn(postsRepository, 'softDeletePost').mockResolvedValueOnce();

      await postsService.deletePost(postId, user);

      expect(postsRepository.findPostById).toHaveBeenCalledWith(postId);
      expect(postsRepository.softDeletePost).toHaveBeenCalledWith(postId);
    });

    test('사용자가 게시물의 저자가 아닌 경우 OnlyAuthorCanAccessException을 발생시켜야 합니다', async () => {
      const postId = 1;
      const user = { id: 1 } as User;
      const post = { id: postId, title: 'Test Post', author: { id: 2 } };

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValueOnce({
        ...post,
        category: { name: '자유게시판' },
      } as Post);

      await expect(postsService.deletePost(postId, user)).rejects.toThrow(
        OnlyAuthorCanAccessException,
      );
    });
  });

  describe('searchPosts', () => {
    test('기준에 따라 게시물을 검색해야 합니다', async () => {
      const criteria = { title: 'Test', username: 'John' };
      const posts = [
        { id: 1, title: 'Test Post' },
        { id: 2, title: 'Another Test Post' },
      ];

      jest
        .spyOn(postsRepository, 'searchPosts')
        .mockResolvedValueOnce(posts as Post[]);

      const result = await postsService.searchPosts(criteria);

      expect(postsRepository.searchPosts).toHaveBeenCalledWith(criteria);
      expect(result).toEqual(posts);
    });
  });

  describe('getLatestPosts', () => {
    test('최신 게시물을 가져와야 합니다', async () => {
      const posts = [
        { id: 1, title: 'Latest Post' },
        { id: 2, title: 'Another Latest Post' },
      ];

      jest
        .spyOn(postsRepository, 'getLatestPosts')
        .mockResolvedValueOnce(posts as Post[]);

      const result = await postsService.getLatestPosts();

      expect(postsRepository.getLatestPosts).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });
  });

  describe('getPopularPosts', () => {
    test('인기 게시물을 가져와야 합니다', async () => {
      const period = 'week';
      const posts = [
        { id: 1, title: 'Popular Post' },
        { id: 2, title: 'Another Popular Post' },
      ];

      jest
        .spyOn(postsRepository, 'getPopularPosts')
        .mockResolvedValueOnce(posts as Post[]);

      const result = await postsService.getPopularPosts(period);

      expect(postsRepository.getPopularPosts).toHaveBeenCalledWith(period);
      expect(result).toEqual(posts);
    });
  });
});
