import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/common/storage/aws-s3.service';
import { CategoriesService } from 'src/domains/categories/categories.service';
import { Category } from 'src/domains/categories/entities';
import { Repository } from 'typeorm';
import { CommentsService } from '../comment/comments.service';
import { Image, Post } from '../entities';
import { PostsController } from '../posts.controller';
import { PostsRepository } from '../posts.repository';
import { PostsService } from '../posts.service';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsRepository,
        PostsService,
        CategoriesService,
        {
          provide: CommentsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Image),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: AwsS3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
