import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: (this.configService.get<string>('DB_TYPE') as 'mysql') || 'mysql',
      host: this.configService.get<string>('DB_HOST') || 'localhost',
      port: this.configService.get<number>('DB_PORT') || 3306,
      username: this.configService.get<string>('DB_USERNAME') || 'root',
      password: this.configService.get<string>('DB_PASSWORD') || 'root',
      database: this.configService.get<string>('DB_DATABASE') || 'test',
      entities: [__dirname + '/../../**/*.entity.{js,ts}'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE') || false,
    };
  }
}
