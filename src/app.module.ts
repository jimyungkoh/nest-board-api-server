import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmConfigModule } from './common/database/type-orm.config.module';
import { AuthModule } from './domains/auth/auth.module';
import { CategoriesModule } from './domains/categories/categories.module';
import { PostsModule } from './domains/posts/posts.module';
import { UsersModule } from './domains/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmConfigModule,
    AuthModule,
    PostsModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
