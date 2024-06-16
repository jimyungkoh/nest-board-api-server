import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Module } from 'src/common/storage/aws-s3.module';
import { CategoriesModule } from '../categories/categories.module';
import { Category } from '../categories/entities';
import { User } from '../users/entities';
import { CommentsModule } from './comment/comments.module';
import { Comment } from './comment/entities';
import { Image, Post } from './entities';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  imports: [
    CategoriesModule,
    TypeOrmModule.forFeature([Post, Category, Image, User, Comment]),
    CommentsModule,
    AwsS3Module,
  ],
})
export class PostsModule {}
