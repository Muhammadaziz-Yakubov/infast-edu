import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LibraryItem, LibraryItemDocument } from './schemas/library-item.schema';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(LibraryItem.name)
    private readonly libraryItemModel: Model<LibraryItemDocument>,
  ) {}

  async create(dto: any): Promise<LibraryItemDocument> {
    const item = new this.libraryItemModel(dto);
    return item.save();
  }

  async findAll(type?: string): Promise<LibraryItemDocument[]> {
    const query = type ? { type } : {};
    return this.libraryItemModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<LibraryItemDocument> {
    const item = await this.libraryItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }

  async update(id: string, dto: any): Promise<LibraryItemDocument> {
    const item = await this.libraryItemModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }

  async remove(id: string): Promise<LibraryItemDocument> {
    const item = await this.libraryItemModel.findByIdAndDelete(id).exec();
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }
}
