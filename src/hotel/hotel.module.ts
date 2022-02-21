import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Hotel } from './entities/hotel.entity';
import { Tag } from './entities/tag.entity';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, Tag])],
  providers: [HotelService, FileService],
  controllers: [HotelController],
})
export class HotelModule {}
