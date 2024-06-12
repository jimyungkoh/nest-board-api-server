import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './domains/auth/auth.module';
import { PostsModule } from './domains/posts/posts.module';
import { UsersModule } from './domains/users/users.module';

@Module({
  imports: [AuthModule, PostsModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
