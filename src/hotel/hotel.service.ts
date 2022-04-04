import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/file/file.service';
import User from 'src/user/entities/user.entity';
import { Repository, Connection, ILike } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Hotel } from './entities/hotel.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    private fileService: FileService,
    private connection: Connection,
  ) {}

  async createHotel(dto: CreateHotelDto, picture): Promise<Hotel> {
    const imagePath = this.fileService.createFile(picture);
    const hotel = this.hotelRepository.create({
      ...dto,
      cities: JSON.parse(dto.cities),
      likes: [],
      tags: JSON.parse(dto.tags),
      image: imagePath,
    });

    await this.hotelRepository.save(hotel);
    return hotel;
  }

  async createTag(dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create({
      ...dto,
    });
    await this.tagRepository.save(tag);
    return tag;
  }

  async updateHotel(id: number, dto: UpdateHotelDto, picture): Promise<Hotel> {
    // await this.hotelRepository.update(id, dto);

    // const updatedHotel = this.hotelRepository.findOne(id, {
    //   relations: ['tags'],
    // });

    const hotel = this.hotelRepository.create({
      id: Number(id),
      ...dto,
    });

    if (picture) {
      const imagePath = this.fileService.createFile(picture);
      hotel.image = imagePath;
    }

    // await this.hotelRepository.update(id, hotel);
    await this.hotelRepository.save(hotel);
    const updatedHotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel', 'user.username', 'user.id', 'tag.id', 'tag.name'])
      .leftJoin('hotel.likes', 'user')
      .leftJoin('hotel.tags', 'tag')
      .where('hotel.id = :id', { id })
      .getOne();

    return updatedHotel;
  }

  async updateTag(id: number, dto: UpdateTagDto): Promise<Tag> {
    await this.tagRepository.update(id, dto);

    const updatedTag = this.tagRepository.findOne(id, {
      relations: ['hotels'],
    });
    return updatedTag;
  }

  async deleteHotel(id: number): Promise<number> {
    await this.hotelRepository.delete(id);
    return id;
  }

  async deleteTag(id: number): Promise<number> {
    await this.tagRepository.delete(id);
    return id;
  }

  async getAllTags(): Promise<Tag[]> {
    return await this.tagRepository.find();
  }

  async getAllHotels(
    filter: string[] = [],
    query: string,
    cities: string[] = [],
  ): Promise<Hotel[]> {
    const hotels = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel', 'user.username', 'user.id', 'tag.id', 'tag.name'])
      .leftJoin('hotel.likes', 'user')
      .leftJoin('hotel.tags', 'tag')
      .where('hotel.name like :query', {
        query: `%${query}%`,
      })
      .getMany();

    return hotels.filter((hotel) => {
      return (
        filter.every((tag) => {
          return hotel.tags.map((hotelTag) => hotelTag.name).includes(tag);
        }) && cities.every((city) => hotel.cities.includes(city))
      );
    });
  }

  async getHotel(id: number): Promise<Hotel> {
    return await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel', 'user.username', 'user.id', 'tag.id', 'tag.name'])
      .leftJoin('hotel.likes', 'user')
      .leftJoin('hotel.tags', 'tag')
      .where('hotel.id = :id', { id })
      .getOne();
  }

  async likeHotel(id: number, user: User): Promise<Hotel> {
    const hotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel', 'user.username', 'user.id', 'tag.id', 'tag.name'])
      .leftJoin('hotel.likes', 'user')
      .leftJoin('hotel.tags', 'tag')
      .where('hotel.id = :id', { id: id })
      .getOne();
    const pushedUser = new User();
    pushedUser.id = user.id;
    pushedUser.username = user.username;

    if (hotel.likes.some((user) => user.id === pushedUser.id)) {
      return hotel;
    }

    hotel.likes.push(pushedUser);
    await this.hotelRepository.save(hotel);

    return hotel;
  }

  async unlikeHotel(id: number, userToDelete: User): Promise<Hotel> {
    const hotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel', 'user.username', 'user.id', 'tag.id', 'tag.name'])
      .leftJoin('hotel.likes', 'user')
      .leftJoin('hotel.tags', 'tag')
      .where('hotel.id = :id', { id: id })
      .getOne();

    hotel.likes = hotel.likes.filter((user) => {
      return user.id !== userToDelete.id;
    });

    await this.hotelRepository.save(hotel);

    return hotel;
  }
}
