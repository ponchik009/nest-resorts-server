import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from './file/file.module';
import { Hotel } from './hotel/entities/hotel.entity';
import { Tag } from './hotel/entities/tag.entity';
import { HotelModule } from './hotel/hotel.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import User from './user/entities/user.entity';
require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [Hotel, Tag, User],
      synchronize: true,
    }),
    HotelModule,
    FileModule,
    AuthenticationModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
      }),
    }),
  ],
})
export class AppModule {}
