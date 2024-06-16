import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/common/storage/aws-s3.service';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entities';
import { CreatePostDto, UpdatePostDto } from './dto';
import { Image, Post } from './entities';
import {
  OnlyAdminCanAccessException,
  OnlyAuthorCanAccessException,
  PostNotFoundException,
} from './exceptions';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    private readonly awsS3Service: AwsS3Service,
    private readonly categoriesService: CategoriesService,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    author: User,
    files?: Express.Multer.File[],
  ) {
    this.validateNoticeCategory(author, createPostDto.categoryName);

    const { title, content, categoryName } = createPostDto;
    const category = await this.categoriesService.findCategoryBy({
      name: categoryName,
    });
    const images = await this.uploadImages(files);
    return this.postsRepository.createPost(
      { title, content, category },
      images,
      author,
    );
  }

  async searchPosts(criteria: { title?: string; username?: string }) {
    return this.postsRepository.searchPosts(criteria);
  }

  async getLatestPosts() {
    return this.postsRepository.getLatestPosts();
  }

  async getPopularPosts(period: 'all' | 'year' | 'month' | 'week') {
    return this.postsRepository.getPopularPosts(period);
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findPostById(id);
    if (!post) {
      throw new PostNotFoundException();
    }
    return post;
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    user: User,
    files?: Express.Multer.File[],
  ) {
    this.validateNoticeCategory(user, updatePostDto.categoryName);

    const post = await this.getPostById(id);
    this.validateAuthor(post, user);
    const images = await this.uploadImages(files);
    return this.postsRepository.updatePost(
      id,
      { ...post, ...updatePostDto },
      images,
    );
  }

  async deletePost(id: number, user: User) {
    const post = await this.getPostById(id);
    this.validateNoticeCategory(user, post.category.name);
    this.validateAuthor(post, user);
    await this.postsRepository.softDeletePost(id);
  }

  async uploadImages(files?: Express.Multer.File[]) {
    if (!files) return [];

    const images = await Promise.all(
      files.map(async (file) => {
        const imageUrl = await this.awsS3Service.uploadImageToS3(file);
        const image = this.imagesRepository.create({
          url: imageUrl,
        });
        await this.imagesRepository.save(image);
        return image;
      }),
    );
    return images;
  }

  private validateNoticeCategory(user: User, categoryName: string) {
    if (user.role !== 'admin' && categoryName === '공지사항') {
      throw new OnlyAdminCanAccessException();
    }
  }

  private validateAuthor(post: Post, user: User) {
    if (user.role !== 'admin' && post.author.id !== user.id) {
      throw new OnlyAuthorCanAccessException();
    }
  }
}
