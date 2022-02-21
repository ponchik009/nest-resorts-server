import { Hotel } from '../entities/hotel.entity';

export class UpdateTagDto {
  readonly id: number;
  readonly name: string;
  readonly hotels: Hotel[];
}
