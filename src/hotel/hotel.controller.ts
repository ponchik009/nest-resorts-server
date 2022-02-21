import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import JwtAuthenticationGuard from 'src/authentication/guard/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { FilterDto } from './dto/filter.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Hotel } from './entities/hotel.entity';
import { Tag } from './entities/tag.entity';
import { HotelService } from './hotel.service';

@Controller('/hotels')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('image'))
  createHotel(
    @Body() dto: CreateHotelDto,
    @UploadedFiles() files,
    @Req() request: RequestWithUser,
  ): Promise<Hotel> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.createHotel(dto, files[0]);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('/tags')
  createTag(
    @Body() dto: CreateTagDto,
    @Req() request: RequestWithUser,
  ): Promise<Tag> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.createTag(dto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('image'))
  updateHotel(
    @UploadedFiles() files,
    @Body() dto: UpdateHotelDto,
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<Hotel> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.updateHotel(id, dto, files && files[0]);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('/like/:id')
  likeHotel(
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<Hotel> {
    return this.hotelService.likeHotel(id, request.user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('/unlike/:id')
  unlikeHotel(
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<Hotel> {
    return this.hotelService.unlikeHotel(id, request.user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('/tags/:id')
  updateTag(
    @Body() dto: UpdateTagDto,
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<Tag> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.updateTag(id, dto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  deleteHotel(
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<number> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.deleteHotel(id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete('/tags/:id')
  deleteTag(
    @Param('id') id: number,
    @Req() request: RequestWithUser,
  ): Promise<number> {
    if (!request.user.isAdmin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.hotelService.deleteTag(id);
  }

  @Get()
  getAllHotels(
    @Query('filter') filter?: string,
    @Query('query') query: string = '',
  ): Promise<Hotel[]> {
    return this.hotelService.getAllHotels(filter && filter.split(','), query);
  }

  @Get('/tags')
  getAllTags(): Promise<Tag[]> {
    return this.hotelService.getAllTags();
  }

  @Get(':id')
  getHotel(@Param('id') id: number) {
    return this.hotelService.getHotel(id);
  }
}
