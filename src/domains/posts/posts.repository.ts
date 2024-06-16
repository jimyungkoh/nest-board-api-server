import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities';
import { Image, Post } from './entities';
import { PostNotFoundException } from './exceptions';

@Injectable()
@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    readonly postsRepository: Repository<Post>,
    @InjectRepository(Image)
    readonly imagesRepository: Repository<Image>,
  ) {}

  async createPost(
    post: Partial<Post>,
    images: Image[],
    author: User,
  ): Promise<Post> {
    const createdPost = this.postsRepository.create({
      ...post,
      images,
      author,
    });
    await this.postsRepository.save(createdPost);
    return this.queryBuilder
      .andWhere('post.id = :id', { id: createdPost.id })
      .getOne();
  }

  async searchPosts(criteria: {
    title?: string;
    username?: string;
  }): Promise<Post[]> {
    const { title, username } = criteria;
    const queryBuilder = this.queryBuilder;

    if (title) {
      queryBuilder.andWhere('post.title LIKE :title', { title: `%${title}%` });
    }

    if (username) {
      queryBuilder.andWhere('author.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    return queryBuilder.getMany();
  }
  async getLatestPosts(): Promise<Post[]> {
    return this.queryBuilder.orderBy('post.createdAt', 'DESC').getMany();
  }

  async getPopularPosts(
    period: 'all' | 'year' | 'month' | 'week',
  ): Promise<Post[]> {
    const queryBuilder = this.queryBuilder.orderBy('post.viewCount', 'DESC');
    if (period !== 'all') {
      const startDate = this.getStartDate(new Date(), period);
      queryBuilder.andWhere('post.createdAt >= :startDate', { startDate });
    }
    return queryBuilder.getMany();
  }

  private getStartDate(
    currentDate: Date,
    period: 'year' | 'month' | 'week',
  ): Date {
    switch (period) {
      case 'year':
        return new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
      case 'month':
        return new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate(),
        );
      case 'week':
        return new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7,
        );
    }
  }

  async findPostById(id: number): Promise<Post> {
    return this.queryBuilder.andWhere('post.id = :id', { id }).getOne();
  }

  async updatePost(
    id: number,
    post: Partial<Post>,
    images?: Image[],
  ): Promise<Post> {
    const existingPost = await this.findPostById(id);
    if (!existingPost) {
      throw new PostNotFoundException();
    }

    await this.imagesRepository.softDelete({ post: { id } });

    if (images) {
      const newImages = images.map((image) => ({
        ...image,
        post: existingPost,
      }));
      await this.imagesRepository.save(newImages);
    }

    const updatedPost = {
      ...existingPost,
      ...post,
      images: images || [],
    };
    await this.postsRepository.save(updatedPost);

    return this.queryBuilder.andWhere('post.id = :id', { id }).getOne();
  }

  async softDeletePost(id: number): Promise<void> {
    await this.postsRepository.softDelete(id);
  }

  private get queryBuilder() {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.createdAt',
        'post.updatedAt',
        'category.name',
        'images.url',
        'author.id',
        'author.username',
      ]);
  }
}
